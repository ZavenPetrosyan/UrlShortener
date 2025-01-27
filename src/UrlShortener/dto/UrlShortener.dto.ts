import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class UrlShortenerRequestDto {
  @ApiProperty({ example: 'https://example.com/some-long-url' })
  @IsNotEmpty()
  @IsUrl()
  originalUrl: string;

  @ApiProperty({ example: 'user_123', required: false })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class UrlShortenerResponseDto {
  @ApiProperty({ example: 'https://short.ly/abc123' })
  shortenedUrl: string;
}
