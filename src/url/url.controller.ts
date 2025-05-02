import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { UrlDTO } from './url.dto';
import { UrlService } from './url.service';

@Controller('url')
export class UrlController {
  constructor(private readonly service: UrlService) {}

  @Get()
  async ProcessImage(@Res() res: Response, @Query() data: UrlDTO) {
    const { response: image, metadata } = await this.service.processImage(data);
    res.setHeader('Content-Type', `image/${metadata.format || 'avif'}`);
    return res.send(image);
  }
}
