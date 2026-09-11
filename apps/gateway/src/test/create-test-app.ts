import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { SwaggerModule } from '@nestjs/swagger';
import type { INestApplication } from '@nestjs/common';
import {
  HealthProbeService,
  MinioStorageService,
  OpenSearchClientService,
  RedisCacheService,
} from '@novacommerce/infrastructure';
import { AppModule } from '../app.module';
import { API_V1_PREFIX } from '../common/constants';
import { createOpenApiDocument } from '../config/swagger.config';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { MinioLifecycleService } from '../infrastructure/minio/minio-lifecycle.service';
import { OpenSearchLifecycleService } from '../infrastructure/opensearch/opensearch-lifecycle.service';
import { RedisLifecycleService } from '../infrastructure/redis/redis-lifecycle.service';
import {
  createMockHealthProbeService,
  createMockMinioStorageService,
  createMockOpenSearchClientService,
  createMockRedisCacheService,
} from './infrastructure-test-utils';
import { applyTestEnvironment } from './test-env';

interface CreateTestAppOptions {
  readonly enableSwagger?: boolean;
  readonly readinessChecks?: Partial<Record<'database' | 'redis' | 'opensearch' | 'minio', 'up' | 'down'>>;
}

export async function createTestApp(
  options: CreateTestAppOptions = {},
): Promise<INestApplication> {
  applyTestEnvironment();

  const healthProbeService = createMockHealthProbeService(options.readinessChecks);

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue({
      onModuleInit: async () => undefined,
      onModuleDestroy: async () => undefined,
      ping: async () => {
        if (options.readinessChecks?.database === 'down') {
          throw new Error('database down');
        }
      },
      $connect: async () => undefined,
      $disconnect: async () => undefined,
    })
    .overrideProvider(RedisCacheService)
    .useValue(createMockRedisCacheService())
    .overrideProvider(OpenSearchClientService)
    .useValue(createMockOpenSearchClientService())
    .overrideProvider(MinioStorageService)
    .useValue(createMockMinioStorageService())
    .overrideProvider(HealthProbeService)
    .useValue(healthProbeService)
    .overrideProvider(RedisLifecycleService)
    .useValue({ onModuleInit: async () => undefined, onModuleDestroy: async () => undefined })
    .overrideProvider(MinioLifecycleService)
    .useValue({ onModuleInit: async () => undefined })
    .overrideProvider(OpenSearchLifecycleService)
    .useValue({ onModuleDestroy: async () => undefined })
    .compile();

  const app = moduleRef.createNestApplication();
  app.enableShutdownHooks();

  app.setGlobalPrefix(API_V1_PREFIX, {
    exclude: ['health', 'health/live', 'health/ready', 'ready', 'openapi.json', 'docs'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  if (options.enableSwagger) {
    const openApiConfig = createOpenApiDocument();
    const document = SwaggerModule.createDocument(app, openApiConfig, {
      operationIdFactory: (controllerKey: string, methodKey: string) =>
        `${controllerKey}_${methodKey}`,
    });

    SwaggerModule.setup('docs', app, document, {
      jsonDocumentUrl: 'openapi.json',
      useGlobalPrefix: false,
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
        docExpansion: 'none',
      },
    });
  }

  await app.init();
  return app;
}
