import {
  Injectable,
  NestMiddleware,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { JWTUtil } from '../middleware/jwtUtil';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);
  private readonly publicRoutes = ['/auth/login', '/api'];

  constructor(private readonly configService: ConfigService) {
    JWTUtil.init(configService);
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const originalUrl = req.originalUrl;
    const normalizedUrl = originalUrl.split('?')[0];

    this.logger.debug(`Incoming request to: ${originalUrl}`);

    if (this.publicRoutes.includes(normalizedUrl)) {
      this.logger.debug(
        `Bypassing authentication for public route: ${normalizedUrl}`,
      );
      return next();
    }

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new ForbiddenException('No token provided');
    }

    try {
      const user = await JWTUtil.decode(token);
      req['user'] = user;
      this.logger.debug(`User authenticated: ${JSON.stringify(user)}`);
      next();
    } catch (error) {
      if (
        error instanceof UnauthorizedException &&
        error.message === 'Token expired'
      ) {
        this.logger.warn('Access token has expired.');
        return res
          .status(401)
          .json({ message: 'Access token expired.', needRefresh: true });
      } else {
        this.logger.error('Authentication failed:', error.stack);
        return res.status(403).json({
          message: 'Access token forbidden or no token provided.',
          needRefresh: true,
        });
      }
    }
  }
}
