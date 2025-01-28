import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UrlShortenerModule } from './modules/urlShortener/urlShortener.module';
import { RedisService } from './database/redis.service';
import { AuthMiddleware } from './middleware/auth.middleware';
import { AuthModule } from './modules/auth/auth.module';
import configuration from './helpers/global.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    DatabaseModule,
    UrlShortenerModule,
    AuthModule,
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'UrlShortener/redirect/:slug', method: RequestMethod.GET }, // Allow redirect without JWT
      )
      .forRoutes('*');
  }
}
