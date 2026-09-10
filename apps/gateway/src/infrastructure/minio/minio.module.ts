import { Global, Module } from '@nestjs/common';
import type { IObjectStorage } from '@novacommerce/building-blocks';
import { MinioStorageService } from '@novacommerce/infrastructure';
import type { AppConfig } from '@novacommerce/infrastructure';
import { APP_CONFIG } from '../../config/app-config.constants';
import { MinioLifecycleService } from './minio-lifecycle.service';

export const OBJECT_STORAGE = Symbol('OBJECT_STORAGE');

@Global()
@Module({
  providers: [
    {
      provide: MinioStorageService,
      useFactory: (config: AppConfig) =>
        new MinioStorageService({
          endpoint: config.minio.endpoint,
          port: config.minio.port,
          accessKey: config.minio.accessKey,
          secretKey: config.minio.secretKey,
          bucket: config.minio.bucket,
          useSsl: config.minio.useSsl,
        }),
      inject: [APP_CONFIG],
    },
    MinioLifecycleService,
    {
      provide: OBJECT_STORAGE,
      useExisting: MinioStorageService,
    },
    {
      provide: 'IObjectStorage',
      useExisting: MinioStorageService,
    },
  ],
  exports: [MinioStorageService, OBJECT_STORAGE, 'IObjectStorage'],
})
export class MinioModule {}

export type { IObjectStorage };
