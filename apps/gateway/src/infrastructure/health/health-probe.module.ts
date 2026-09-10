import { Global, Module } from '@nestjs/common';
import { HealthProbeService } from '@novacommerce/infrastructure';
import { MinioStorageService } from '@novacommerce/infrastructure';
import { OpenSearchClientService } from '@novacommerce/infrastructure';
import { RedisCacheService } from '@novacommerce/infrastructure';
import { PrismaService } from '../database/prisma.service';

@Global()
@Module({
  providers: [
    {
      provide: HealthProbeService,
      useFactory: (
        prisma: PrismaService,
        redis: RedisCacheService,
        openSearch: OpenSearchClientService,
        minio: MinioStorageService,
      ) =>
        new HealthProbeService({
          database: () => prisma.ping(),
          redis: () => redis.ping(),
          opensearch: () => openSearch.ping(),
          minio: () => minio.ping(),
        }),
      inject: [PrismaService, RedisCacheService, OpenSearchClientService, MinioStorageService],
    },
  ],
  exports: [HealthProbeService],
})
export class HealthProbeModule {}
