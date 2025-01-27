import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { InjectModel } from '@nestjs/mongoose';
import { UrlShortener, UrlShortenerDocument } from './urlShortener.entity';
import { Model } from 'mongoose';
import { UrlShortenerResponseDto } from './dto/UrlShortener.dto';
import { RedisService } from '../helpers/redis.service';

@Injectable()
export class UrlShortenerService {
  constructor(
    @InjectModel(UrlShortener.name)
    private urlShortenerModel: Model<UrlShortenerDocument>,
    private redisService: RedisService, // ✅ Inject shared RedisService
  ) {}

  async createShortUrl(originalUrl: string, userId?: string): Promise<UrlShortenerResponseDto> {
    let slug = nanoid(6);
    let exists = await this.urlShortenerModel.findOne({ slug });

    while (exists) {
      slug = nanoid(6);
      exists = await this.urlShortenerModel.findOne({ slug });
    }

    const shortenedUrl = `${process.env.BASE_URL}/${slug}`;
    const redisClient = this.redisService.getClient(); // ✅ Ensure Redis is open

    try {
      const newShortUrl = new this.urlShortenerModel({
        slug,
        originalUrl,
        shortenedUrl,
        userId,
      });

      await newShortUrl.save();

      console.log(`🔹 Storing in Redis: key=shorturl:${slug}, value=${originalUrl}`);

      if (!redisClient.isOpen) {
        console.warn('⚠️ Redis client was closed! Attempting to reconnect...');
        await this.redisService.onModuleInit();
      }

      await redisClient.set(`shorturl:${slug}`, originalUrl, { EX: 3600 });

      const redisCheck = await redisClient.get(`shorturl:${slug}`);
      if (!redisCheck) {
        console.error(`❌ Redis did NOT store the key=shorturl:${slug}`);
      } else {
        console.log(`✅ Redis Stored Successfully: key=shorturl:${slug}, value=${redisCheck}`);
      }
    } catch (error) {
      console.error('❌ Error saving URL:', error);
      throw new ConflictException('Error while storing the short URL');
    }

    return { shortenedUrl };
  }

  async getOriginalUrl(slug: string): Promise<string> {
    const redisClient = this.redisService.getClient();
    try {
      console.log(`🔹 Checking Redis Cache: key=shorturl:${slug}`);

      const cachedUrl = await redisClient.get(`shorturl:${slug}`);
      if (cachedUrl) {
        console.log(`Cache Hit: key=shorturl:${slug}`);
        return cachedUrl;
      }

      console.log(`⚠️ Cache Miss: Fetching from MongoDB`);

      const result = await this.urlShortenerModel.findOne({ slug });

      if (!result) {
        console.warn(`URL Not Found for slug=${slug}`);
        throw new NotFoundException('Short URL not found');
      }

      await redisClient.set(`shorturl:${slug}`, result.originalUrl, { EX: 3600 });

      console.log(`URL Cached in Redis: key=shorturl:${slug}`);
      return result.originalUrl;
    } catch (error) {
      console.error('Error retrieving URL:', error);
      throw new NotFoundException('Short URL retrieval failed');
    }
  }
}

