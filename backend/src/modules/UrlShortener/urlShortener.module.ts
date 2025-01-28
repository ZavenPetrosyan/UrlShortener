import { Module } from '@nestjs/common';
import { UrlShortenerController } from './urlShortener.controller';
import { UrlShortenerService } from './urlShortener.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UrlShortener,
  UrlShortenerSchema,
} from '../../models/urlShortener.model';
import { RedisModule } from '../../cache/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UrlShortener.name, schema: UrlShortenerSchema },
    ]),
    RedisModule,
  ],
  controllers: [UrlShortenerController],
  providers: [UrlShortenerService],
  exports: [UrlShortenerService],
})
export class UrlShortenerModule {}
