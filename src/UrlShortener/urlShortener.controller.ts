import {
  Body,
  Controller,
  Get,
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
  @ApiOperation({ summary: 'Redirect to original URL' })
  async redirect(@Param('slug') slug: string, @Res() res: Response) {
    const originalUrl = await this.urlShortenerService.getOriginalUrl(slug);
    if (!originalUrl) throw new NotFoundException('URL not found');

    return res.redirect(originalUrl);
  }
}
