import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { API_V1_PREFIX } from './common/constants';
import { createOpenApiDocument } from './config/swagger.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
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

  const corsOrigin = process.env.CORS_ORIGIN;
  if (corsOrigin) {
    app.enableCors({
      origin: corsOrigin.split(',').map((value) => value.trim()),
      credentials: true,
    });
  }

  const openApiConfig = createOpenApiDocument();
  const document = SwaggerModule.createDocument(app, openApiConfig);

  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'openapi.json',
    useGlobalPrefix: false,
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
}

bootstrap().catch((error: unknown) => {
  console.error('Gateway failed to start', error);
  process.exit(1);
});
