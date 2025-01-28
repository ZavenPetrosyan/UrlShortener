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
import { RedisService } from '../../database/redis.service';

@Injectable()
export class UrlShortenerService {
  constructor(
    @InjectModel(UrlShortener.name)
    private readonly urlShortenerModel: Model<UrlShortenerDocument>,
    private readonly redisService: RedisService,
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
    const existingUrl = await this.urlShortenerModel.findOne({
      originalUrl,
      user: userId,
    });
    if (existingUrl) {
      throw new ConflictException('This URL has already been shortened.');
    }

    let slug = nanoid(6);
    while (await this.urlShortenerModel.exists({ slug })) {
      slug = nanoid(6);
    }

    const shortenedUrl = `${process.env.BASE_URL}/${slug}`;
    const redisClient = this.redisService.getClient();

    try {
      await this.urlShortenerModel.create({
        slug,
        originalUrl,
        shortenedUrl,
        user: new Types.ObjectId(userId),
      });

      console.log(`Caching in Redis: ${slug} -> ${originalUrl}`);
      await redisClient.set(`shorturl:${slug}:${userId}`, originalUrl, {
        EX: 86400,
      });

      return { shortenedUrl };
    } catch (error) {
      console.error('Error saving URL:', error);
      throw new ConflictException('Error while storing the short URL');
    }
  }

  async updateSlug(id: string, newSlug: string, userId: string) {
    const existingUrl = await this.urlShortenerModel.findOne({
      _id: id,
      user: userId,
    });
    if (!existingUrl) throw new NotFoundException('URL not found');

    const slugExists = await this.urlShortenerModel.findOne({ slug: newSlug });
    if (slugExists) throw new ConflictException('Slug already in use');

    const redisClient = this.redisService.getClient();

    await redisClient.del(`shorturl:${existingUrl.slug}:${userId}`);

    existingUrl.slug = newSlug;
    existingUrl.shortenedUrl = `${process.env.BASE_URL}/${newSlug}`;
    await existingUrl.save();

    await redisClient.set(
      `shorturl:${newSlug}:${userId}`,
      existingUrl.originalUrl,
      { EX: 86400 },
    );

    return existingUrl;
  }

  async getOriginalUrl(slug: string) {
    const urlEntry = await this.urlShortenerModel.findOneAndUpdate(
      { slug },
      { $inc: { visits: 1 } },
      { new: true },
    );

    if (!urlEntry) {
      throw new NotFoundException('Short URL not found.');
    }

    return urlEntry.originalUrl;
  }
}
