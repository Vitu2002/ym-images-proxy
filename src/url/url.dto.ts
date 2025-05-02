/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export enum ImageFormat {
  JPEG = 'jpeg',
  PNG = 'png',
  WEBP = 'webp',
  AVIF = 'avif',
  GIF = 'gif',
}
export enum ImageMethod {
  CROP = 'crop',
  RESIZE = 'resize',
}
export class UrlDTO {
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @Transform(({ value }: { value: string }) => parseInt(value))
  @IsInt()
  @Min(32)
  @Max(1920)
  @IsOptional()
  width: number;

  @Transform(({ value }: { value: string }) => parseInt(value))
  @IsInt()
  @Min(32)
  @Max(1920)
  @IsOptional()
  height: number;

  @IsOptional()
  @IsEnum(ImageFormat)
  format: ImageFormat;

  @Transform(({ value }: { value: string }) => parseInt(value))
  @IsInt()
  @Min(30)
  @Max(100)
  @IsOptional()
  quality: number;

  @IsOptional()
  @IsEnum(ImageMethod)
  method: ImageMethod;
}
