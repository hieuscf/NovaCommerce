import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { SwaggerModule } from '@nestjs/swagger';
import type { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
import { API_V1_PREFIX } from '../common/constants';
import { createOpenApiDocument } from '../config/swagger.config';
import { PrismaService } from '../infrastructure/database/prisma.service';

interface CreateTestAppOptions {
  readonly enableSwagger?: boolean;
}

export async function createTestApp(
  options: CreateTestAppOptions = {},
): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue({
      onModuleInit: async () => undefined,
      onModuleDestroy: async () => undefined,
      ping: async () => undefined,
      $connect: async () => undefined,
      $disconnect: async () => undefined,
    })
    .compile();

  const app = moduleRef.createNestApplication();
  app.enableShutdownHooks();

  app.setGlobalPrefix(API_V1_PREFIX, {
    exclude: ['health', 'ready', 'openapi.json', 'docs'],
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
    const document = SwaggerModule.createDocument(app, openApiConfig);

    SwaggerModule.setup('docs', app, document, {
      jsonDocumentUrl: 'openapi.json',
      useGlobalPrefix: false,
    });
  }

  await app.init();
  return app;
}
