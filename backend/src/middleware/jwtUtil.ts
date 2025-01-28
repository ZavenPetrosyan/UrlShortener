import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';

export class JWTUtil {
  private static secretKey: string;

  static init(configService: ConfigService) {
    this.secretKey = configService.get<string>('jwtSecret');

    if (!this.secretKey) {
      throw new Error(
        'JWT_SECRET is not defined! Check your environment variables.',
      );
    }
  }

  static encode(
    payload: object,
    options: jwt.SignOptions = { expiresIn: '7d' },
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.secretKey) {
        return reject(
          new Error(
            'JWTUtil is not initialized! Call JWTUtil.init(configService) first.',
          ),
        );
      }

      jwt.sign(payload, this.secretKey, options, (err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      });
    });
  }

  static decode(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        jwt.verify(token, this.secretKey, (err, decoded) => {
          if (err) {
            if (err.name === 'TokenExpiredError') {
              reject(new UnauthorizedException('Token expired'));
            } else {
              reject(err);
            }
          } else {
            const user = decoded as any;
            user.id = user.userId;
            resolve(user);
          }
        });
      } catch (e) {
        console.error('Invalid token', e);
        reject(new ForbiddenException('Invalid token'));
      }
    });
  }
}
