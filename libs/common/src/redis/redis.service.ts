import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD', ''),
      username: this.configService.get<string>('REDIS_USERNAME', ''),
      maxRetriesPerRequest: null,
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async publishEvent(
    stream: string,
    event: Record<string, any>,
  ): Promise<void> {
    const entries = Object.entries(event);
    const eventData: (string | number)[] = [];
    for (const [key, value] of entries) {
      eventData.push(key, String(value));
    }
    await this.client.xadd(stream, '*', ...eventData);
  }

  getClient(): Redis {
    return this.client;
  }
}
