import { Module } from '@nestjs/common';
import { UrlShortenerController } from './urlShortener.controller';
import { UrlShortenerService } from './urlShortener.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UrlShortener,
  UrlShortenerSchema,
} from '../../models/urlShortener.model';
import { RedisService } from '../../database/redis.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UrlShortener.name, schema: UrlShortenerSchema },
    ]),
  ],
  controllers: [UrlShortenerController],
  providers: [UrlShortenerService, RedisService],
  exports: [UrlShortenerService],
})
export class UrlShortenerModule {}
