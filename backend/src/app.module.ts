import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UrlShortenerModule } from './UrlShortener/urlShortener.module';
import { RedisService } from './helpers/redis.service';

@Module({
  imports: [DatabaseModule, UrlShortenerModule],
  providers: [RedisService],
  exports: [RedisService],
})
export class AppModule {}
