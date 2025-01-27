import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

import { AppModule } from './app.module';
import { RedisService } from './helpers/redis.service';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.use(helmet());

  // Body Parsing
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: true, limit: '1mb' }));

  // Validation Pipes
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Setup Redis Client
  const redisService = app.get(RedisService);
  const redisClient = redisService.getClient();

  // Rate Limiting
  app.use(
    rateLimit({
      store: new RedisStore({
        sendCommand: (...args: string[]) => redisClient.sendCommand(args),
      }),
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests, please try again later.',
    }),
  );

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('UrlShortener APIs')
    .setDescription('API documentation for UrlShortener')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  // Start the application
  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.log(`🚀 Service is running on http://localhost:${PORT}`);
}

bootstrap();
