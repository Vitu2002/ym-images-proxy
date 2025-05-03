import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { AppModule } from './app.module';

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app
    .listen(process.env.PORT ?? 3000)
    .then(() => Logger.log(`Listening on port ${process.env.PORT ?? 3000}`));
}

void bootstrap();
