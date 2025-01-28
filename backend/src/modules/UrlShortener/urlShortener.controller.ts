import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { UrlShortenerService } from './urlShortener.service';
import {
  UrlShortenerRequestDto,
  UrlShortenerResponseDto,
} from './dto/UrlShortener.dto';
import { isValidUrl } from '../../helpers/url.helper';
import { GetUser } from '../../middleware/getUser';

@ApiTags('UrlShortener')
@ApiBearerAuth('User-JWT')
@Controller('UrlShortener')
export class UrlShortenerController {
  constructor(private readonly urlShortenerService: UrlShortenerService) {}

  @Post()
  @ApiOperation({ summary: 'Shorten a long URL' })
  @ApiResponse({ status: 201, type: UrlShortenerResponseDto })
  async shortenUrl(
    @Body() requestDto: UrlShortenerRequestDto,
    @GetUser() user: { id: string },
  ): Promise<UrlShortenerResponseDto> {
    const { originalUrl } = requestDto;

    if (!isValidUrl(originalUrl)) {
      throw new BadRequestException('Invalid URL format');
    }

    return this.urlShortenerService.createShortUrl(originalUrl, user.id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get original URL for redirection' })
  async getOriginalUrl(
    @Param('slug') slug: string,
    @GetUser() user: { id: string },
  ) {
    console.log(`Incoming GET request for slug: ${slug}`);
    const originalUrl = await this.urlShortenerService.getOriginalUrl(
      slug,
      user.id,
    );
    if (!originalUrl) {
      console.warn(`No URL found for slug=${slug}`);
      throw new NotFoundException('URL not found');
    }
    return { originalUrl };
  }

  @Get('user/urls')
  @ApiOperation({ summary: 'Get all URLs created by the authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns user’s URLs' })
  async getUserUrls(@GetUser() user: { id: string }) {
    return this.urlShortenerService.getUserUrls(user.id);
  }
}
