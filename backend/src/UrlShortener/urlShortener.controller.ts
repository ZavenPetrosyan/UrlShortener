import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';

import { UrlShortenerService } from './urlShortener.service';
import {
  UrlShortenerRequestDto,
  UrlShortenerResponseDto,
} from './dto/UrlShortener.dto';

@ApiTags('UrlShortener')
@Controller('UrlShortener')
export class UrlShortenerController {
  constructor(private readonly urlShortenerService: UrlShortenerService) {}

  @Post()
  @ApiOperation({ summary: 'Shorten a long URL' })
  @ApiResponse({ status: 201, type: UrlShortenerResponseDto })
  async shortenUrl(
    @Body() requestDto: UrlShortenerRequestDto,
  ): Promise<UrlShortenerResponseDto> {
    return this.urlShortenerService.createShortUrl(
      requestDto.originalUrl,
      requestDto.userId,
    );
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get original URL for redirection' })
  async getOriginalUrl(@Param('slug') slug: string) {
    console.log(`Incoming GET request for slug: ${slug}`);

    try {
      const originalUrl = await this.urlShortenerService.getOriginalUrl(slug);

      if (!originalUrl) {
        console.warn(`No URL found for slug=${slug}`);
        throw new NotFoundException('URL not found');
      }

      console.log(`Retrieved original URL: ${originalUrl}`);

      return { originalUrl };
    } catch (error) {
      console.error(`Error fetching URL for slug=${slug}:`, error.message);
      throw new InternalServerErrorException('Error processing request');
    }
  }
}
