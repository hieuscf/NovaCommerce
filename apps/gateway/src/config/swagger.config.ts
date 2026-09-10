import { DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';
import { API_V1_PREFIX } from '../common/constants';

export function createOpenApiDocument(): Omit<OpenAPIObject, 'paths'> {
  return new DocumentBuilder()
    .setTitle('NovaCommerce API')
    .setDescription('NovaCommerce Enterprise E-Commerce Platform API')
    .setVersion('1.0')
    .addServer(`/${API_V1_PREFIX}`, 'API v1')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token',
      },
      'bearer',
    )
    .build();
}
