import { Global, Module } from '@nestjs/common';
import type { ICache } from '@novacommerce/building-blocks';
import { RedisCacheService } from '@novacommerce/infrastructure';
import type { AppConfig } from '@novacommerce/infrastructure';
import { APP_CONFIG } from '../../config/app-config.constants';
import { RedisLifecycleService } from './redis-lifecycle.service';

export const CACHE_SERVICE = Symbol('CACHE_SERVICE');

@Global()
@Module({
  providers: [
    {
      provide: RedisCacheService,
      useFactory: (config: AppConfig) =>
        new RedisCacheService({
          url: config.redis.url,
        }),
      inject: [APP_CONFIG],
    },
    RedisLifecycleService,
    {
      provide: CACHE_SERVICE,
      useExisting: RedisCacheService,
    },
    {
      provide: 'ICache',
      useExisting: RedisCacheService,
    },
  ],
  exports: [RedisCacheService, CACHE_SERVICE, 'ICache'],
})
export class RedisModule {}

export type { ICache };
