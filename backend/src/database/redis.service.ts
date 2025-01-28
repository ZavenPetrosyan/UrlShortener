import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: RedisClientType;

  constructor() {
    this.redisClient = createClient({ url: process.env.REDIS_URL });

    this.redisClient.on('error', (err) => {
      console.error('Redis Connection Error:', err);
    });

    this.redisClient.on('end', () => {
      console.warn('Redis Client Closed! Attempting to reconnect...');
      this.initRedis();
    });
  }

  async onModuleInit() {
    await this.initRedis();
  }

  private async initRedis() {
    if (!this.redisClient.isOpen) {
      await this.redisClient.connect();
      console.log('Redis Connected Successfully');
    }
  }

  async onModuleDestroy() {
    console.log('Closing Redis connection...');
    await this.redisClient.quit();
  }

  getClient(): RedisClientType {
    if (!this.redisClient.isOpen) {
      console.warn('Redis Client was closed! Reconnecting...');
      this.initRedis();
    }
    return this.redisClient;
  }
}
