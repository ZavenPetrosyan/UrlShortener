import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Res,
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
import { Response } from 'express';

@ApiTags('UrlShortener')
// @ApiBearerAuth('User-JWT')
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

  @Get('user/urls')
  @ApiOperation({ summary: 'Get all URLs created by the authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns user’s URLs' })
  async getUserUrls(@GetUser() user: { id: string }) {
    return this.urlShortenerService.getUserUrls(user.id);
  }

  @Patch('update-slug')
  @ApiOperation({ summary: 'Update a shortened URL slug' })
  @ApiResponse({ status: 200, description: 'Slug updated successfully' })
  async updateSlug(
    @Body() updateSlugDto: { id: string; newSlug: string },
    @GetUser() user: { id: string },
  ) {
    return this.urlShortenerService.updateSlug(
      updateSlugDto.id,
      updateSlugDto.newSlug,
      user.id,
    );
  }

  @Get('redirect/:slug')
  @ApiOperation({ summary: 'Redirect to original URL and track visits' })
  @ApiResponse({ status: 302, description: 'Redirects to the original URL' })
  async redirectToOriginalUrl(
    @Param('slug') slug: string,
    @Res() res: Response,
  ) {
    try {
      const originalUrl = await this.urlShortenerService.getOriginalUrl(slug);

      if (!originalUrl) {
        throw new NotFoundException('Short URL not found');
      }

      console.log(`Redirecting to: ${originalUrl}`);

      return res.redirect(302, originalUrl);
    } catch (error) {
      console.log('Redirection failed:', error);
      return res.status(404).json({ message: 'Short URL not found' });
    }
  }
}
