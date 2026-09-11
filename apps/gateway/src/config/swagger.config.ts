import { DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';

export function createOpenApiDocument(): Omit<OpenAPIObject, 'paths'> {
  return new DocumentBuilder()
    .setTitle('NovaCommerce API')
    .setDescription(
      [
        'NovaCommerce Enterprise E-Commerce Platform API.',
        '',
        '**Authentication:** Use `POST /auth/login` to obtain a JWT, then click **Authorize** and paste `Bearer <token>`.',
        '',
        '**User module:** Customer profile, shipping addresses, and preferences for the authenticated identity (`/users/me/*`).',
      ].join('\n'),
    )
    .setVersion('1.0')
    .addServer('http://localhost:3000/api/v1', 'Local development (API v1)')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token from POST /auth/login',
      },
      'bearer',
    )
    .addTag('auth', 'Registration, login, logout, token refresh, password management')
    .addTag('users', 'Customer profile, addresses, and preferences (authenticated `/users/me` routes)')
    .addTag('roles', 'RBAC roles, permissions, and identity role assignments')
    .addTag('Identity', 'Authenticated principal and security context')
    .build();
}
