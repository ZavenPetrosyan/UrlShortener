import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

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
    const originalUrl = await this.urlShortenerService.getOriginalUrl(slug);
    if (!originalUrl) {
      console.warn(`No URL found for slug=${slug}`);
      throw new NotFoundException('URL not found');
    }
    return { originalUrl };
  }
}
