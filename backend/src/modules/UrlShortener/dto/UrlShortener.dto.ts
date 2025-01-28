import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class UrlShortenerRequestDto {
  @ApiProperty({ example: 'https://example.com/some-long-url' })
  @IsUrl({}, { message: 'Invalid URL format' })
  @IsNotEmpty()
  originalUrl: string;
}

export class UrlShortenerResponseDto {
  @ApiProperty({ example: 'https://short.ly/abc123' })
  shortenedUrl: string;
}
