import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { nanoid } from 'nanoid';
import { InjectModel } from '@nestjs/mongoose';
import {
  UrlShortener,
  UrlShortenerDocument,
} from '../../models/urlShortener.model';
import { Model, Types } from 'mongoose';
import { UrlShortenerResponseDto } from './dto/UrlShortener.dto';
import { RedisService } from '../../helpers/redis.service';

@Injectable()
export class UrlShortenerService {
  constructor(
    @InjectModel(UrlShortener.name)
    private urlShortenerModel: Model<UrlShortenerDocument>,
    private redisService: RedisService,
  ) {}

  async getUserUrls(userId: string) {
    return this.urlShortenerModel
      .find({ user: userId })
      .select('-_id slug originalUrl shortenedUrl')
      .lean();
  }

  async createShortUrl(
    originalUrl: string,
    userId: string,
  ): Promise<UrlShortenerResponseDto> {
    let slug = nanoid(6);
    let exists = await this.urlShortenerModel.findOne({ slug });

    while (exists) {
      slug = nanoid(6);
      exists = await this.urlShortenerModel.findOne({ slug });
    }

    const shortenedUrl = `${process.env.BASE_URL}/${slug}`;
    const redisClient = this.redisService.getClient();

    try {
      const newShortUrl = new this.urlShortenerModel({
        slug,
        originalUrl,
        shortenedUrl,
        user: new Types.ObjectId(userId),
      });

      await newShortUrl.save();

      console.log(
        `Storing in Redis: key=shorturl:${slug}, value=${originalUrl}`,
      );

      if (!redisClient.isOpen) {
        console.warn('Redis client was closed! Attempting to reconnect...');
        await this.redisService.onModuleInit();
      }

      await redisClient.set(`shorturl:${slug}:${userId}`, originalUrl, {
        EX: 3600,
      });
    } catch (error) {
      console.error('Error saving URL:', error);
      throw new ConflictException('Error while storing the short URL');
    }

    return { shortenedUrl };
  }

  async getOriginalUrl(slug: string, userId: string): Promise<string> {
    const redisClient = this.redisService.getClient();

    try {
      console.log(`Checking Redis Cache: key=shorturl:${slug}`);

      const cachedUrl = await redisClient.get(`shorturl:${slug}:${userId}`);
      if (cachedUrl) {
        console.log(
          `Cache Hit: key=shorturl:${slug}:${userId}, URL=${cachedUrl}`,
        );
        return cachedUrl;
      }

      console.log(`Cache Miss: Fetching from MongoDB for userId=${userId}`);

      const result = await this.urlShortenerModel.findOne({
        slug,
        user: userId,
      });

      if (!result) {
        console.warn(`URL Not Found for slug=${slug} and userId=${userId}`);
        throw new NotFoundException(
          'Short URL not found or unauthorized access',
        );
      }

      await redisClient.set(`shorturl:${slug}:${userId}`, result.originalUrl, {
        EX: 3600,
      });

      return result.originalUrl;
    } catch (error) {
      console.error(`Error retrieving URL for slug=${slug}:`, error.message);
      throw new InternalServerErrorException('Short URL retrieval failed');
    }
  }
}
