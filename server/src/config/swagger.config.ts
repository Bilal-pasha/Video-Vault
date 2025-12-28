import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Video Mobile Application API')
  .setDescription('API documentation for Video Mobile Application')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
