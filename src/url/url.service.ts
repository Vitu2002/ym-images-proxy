import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { writeFileSync } from 'node:fs';
import * as sharp from 'sharp';
import { ImageMethod, UrlDTO } from './url.dto';

@Injectable()
export class UrlService {
  private readonly MAX_ATTEMPTS = 3;
  private readonly allowedDomains: string[] = ([] as string[]).concat(
    (process.env.ALLOWED_DOMAINS ?? '').split(','),
  );
  public validateImageUrl(url: string) {
    const isValid = this.allowedDomains.some((domain) =>
      url.startsWith(domain),
    );
    if (!isValid) throw new UnauthorizedException('Domain not allowed');
    return url;
  }

  async processImage(data: UrlDTO) {
    const { url, ...options } = data;
    this.validateImageUrl(url);

    const image = await this.downloadImage(url);

    try {
      return await this.transformImage(image, options);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async transformImage(buffer: Buffer, options: Omit<UrlDTO, 'url'>) {
    const { width, height, format, quality } = options;
    writeFileSync('image.jpg', buffer);
    const image = sharp(buffer);
    if (width || height) {
      if (options.method === ImageMethod.CROP) {
        image.resize({
          width,
          height,
          fit: sharp.fit.cover,
          position: sharp.strategy.entropy,
        });
      } else {
        image.resize({ width, height });
      }
    }
    const response = await image
      .toFormat(format || 'avif', { quality })
      .toBuffer();
    const metadata = await sharp(response).metadata();
    return {
      response,
      metadata,
    };
  }

  private async downloadImage(url: string) {
    let tries = 0;
    while (tries < this.MAX_ATTEMPTS) {
      try {
        const { data, headers } = await axios.get<Buffer>(url, {
          responseType: 'arraybuffer',
        });
        const contentType: string =
          String(headers['content-type'] || headers['Content-Type']) || '';
        if (!contentType.startsWith('image/'))
          throw new BadRequestException('Invalid URL content type');
        if (data.byteLength === 0)
          throw new BadRequestException('Invalid Image URL');
        return data;
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 429) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          tries++;
          continue;
        } else if (error instanceof AxiosError) {
          switch (error.response?.status) {
            case 400:
              throw new BadRequestException('Invalid Image URL 400');
            case 403:
              throw new ForbiddenException('Invalid Image URL 403');
            case 404:
              throw new NotFoundException('Invalid Image URL 404');
            default:
              throw new InternalServerErrorException('Invalid Image URL 500');
          }
        }
        throw new BadRequestException('Failed to download image');
      }
    }

    throw new BadRequestException('Failed to download image');
  }
}
