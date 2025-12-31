import { Injectable } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisOAuthStore {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    });
    
    this.client.on('error', (err) => console.error('Redis OAuth Store Error', err));
    this.client.connect();
  }

  async set(key: string, value: any): Promise<void> {
    await this.client.setEx(key, 600, JSON.stringify(value)); // 10 min expiry
  }

  async get(key: string): Promise<any> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async destroy(key: string): Promise<void> {
    await this.client.del(key);
  }
}

