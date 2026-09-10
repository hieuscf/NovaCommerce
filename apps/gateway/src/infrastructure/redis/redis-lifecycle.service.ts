import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RedisCacheService } from '@novacommerce/infrastructure';

@Injectable()
export class RedisLifecycleService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly redisCacheService: RedisCacheService) {}

  async onModuleInit(): Promise<void> {
    await this.redisCacheService.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.redisCacheService.disconnect();
  }
}
