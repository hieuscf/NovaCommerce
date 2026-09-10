import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { JwtAuthService } from './auth/jwt-auth.service';
import { TEST_ADMIN, TEST_USER } from './test/auth-test-utils';
import { createOpenApiDocument } from './config/swagger.config';
import { createTestApp } from './test/create-test-app';

describe('Gateway API', () => {
  let app: INestApplication;
  let jwtAuthService: JwtAuthService;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    app = await createTestApp();
    jwtAuthService = app.get(JwtAuthService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns 200', async () => {
    const response = await request(app.getHttpServer()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe('gateway');
  });

  it('GET /api/v1 returns API root metadata', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1');

    expect(response.status).toBe(200);
    expect(response.body.data.version).toBe('v1');
    expect(response.body.meta.requestId).toBeDefined();
  });

  it('GET /api/v1/unknown returns standard 404 error', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/unknown-route');

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
    expect(response.body.error.requestId).toBeDefined();
  });

  it('POST /api/v1/_meta/echo accepts valid DTO', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/_meta/echo')
      .send({ message: 'hello' });

    expect(response.status).toBe(200);
    expect(response.body.data.message).toBe('hello');
  });

  it('GET /api/v1/me returns 401 without token', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/me');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('GET /api/v1/me returns principal with valid token', async () => {
    const token = jwtAuthService.createAccessToken(TEST_USER);

    const response = await request(app.getHttpServer())
      .get('/api/v1/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.userId).toBe(TEST_USER.userId);
  });

  it('GET /api/v1/admin/status returns 403 without permission', async () => {
    const token = jwtAuthService.createAccessToken(TEST_USER);

    const response = await request(app.getHttpServer())
      .get('/api/v1/admin/status')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('GET /api/v1/admin/status returns 200 with required permission', async () => {
    const token = jwtAuthService.createAccessToken(TEST_ADMIN);

    const response = await request(app.getHttpServer())
      .get('/api/v1/admin/status')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('ok');
  });

  it('OpenAPI config includes v1 server and bearer security scheme', () => {
    const config = createOpenApiDocument();

    expect(config.info?.title).toBe('NovaCommerce API');
    expect(config.servers?.[0]?.url).toBe('/api/v1');
    expect(config.components?.securitySchemes?.bearer).toMatchObject({
      type: 'http',
      scheme: 'bearer',
    });
  });

  it('GET /openapi.json is served when Swagger is enabled', async () => {
    const swaggerApp = await createTestApp({ enableSwagger: true });

    try {
      const response = await request(swaggerApp.getHttpServer()).get('/openapi.json');

      expect(response.status).toBe(200);
      expect(response.body.openapi).toBeDefined();
      expect(response.body.paths['/api/v1']).toBeDefined();
    } finally {
      await swaggerApp.close();
    }
  });
});
