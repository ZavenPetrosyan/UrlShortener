import {
  Injectable,
  ConflictException,
  NotFoundException,
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
      .select('_id slug visits shortenedUrl')
      .lean();
  }  

  async createShortUrl(
    originalUrl: string,
    userId: string,
  ): Promise<UrlShortenerResponseDto> {
    const existingUrl = await this.urlShortenerModel.findOne({ originalUrl, user: userId });
    if (existingUrl) {
      throw new ConflictException('This URL has already been shortened.');
    }

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

  async updateSlug(id: string, newSlug: string, userId: string) {
    const existingUrl = await this.urlShortenerModel.findOne({
      _id: id,
      user: userId,
    });

    if (!existingUrl) {
      throw new NotFoundException('URL not found');
    }

    const slugExists = await this.urlShortenerModel.findOne({ slug: newSlug });
    if (slugExists) {
      throw new ConflictException('Slug already in use');
    }

    const redisClient = this.redisService.getClient();

    await redisClient.del(`shorturl:${existingUrl.slug}:${userId}`);

    existingUrl.slug = newSlug;
    existingUrl.shortenedUrl = `${process.env.BASE_URL}/${newSlug}`;
    await existingUrl.save();

    await redisClient.set(
      `shorturl:${newSlug}:${userId}`,
      existingUrl.originalUrl,
      { EX: 3600 },
    );

    return existingUrl;
  }

  async getOriginalUrl(slug: string, userId?: string) {
    const urlEntry = await this.urlShortenerModel.findOne({ slug });

    if (!urlEntry) {
      throw new NotFoundException('Short URL not found');
    }

    urlEntry.visits = (urlEntry.visits || 0) + 1;
    await urlEntry.save();

    return urlEntry.originalUrl;
  }
}
