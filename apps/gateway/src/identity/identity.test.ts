import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AppModule } from '../app.module';
import { API_V1_PREFIX } from '../common/constants';
import { PrismaService } from '../infrastructure/database/prisma.service';
import {
  createMockHealthProbeService,
  createMockMinioStorageService,
  createMockOpenSearchClientService,
  createMockRedisCacheService,
} from '../test/infrastructure-test-utils';
import { applyTestEnvironment } from '../test/test-env';
import {
  HealthProbeService,
  MinioStorageService,
  OpenSearchClientService,
  RedisCacheService,
} from '@novacommerce/infrastructure';
import { MinioLifecycleService } from '../infrastructure/minio/minio-lifecycle.service';
import { OpenSearchLifecycleService } from '../infrastructure/opensearch/opensearch-lifecycle.service';
import { RedisLifecycleService } from '../infrastructure/redis/redis-lifecycle.service';

function createIdentityPrismaMock() {
  const identities = new Map<string, { id: string; email: string; status: string; disabled: boolean }>();

  return {
    onModuleInit: async () => undefined,
    onModuleDestroy: async () => undefined,
    ping: async () => undefined,
    $connect: async () => undefined,
    $disconnect: async () => undefined,
    $transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn(createIdentityPrismaMock()),
    identity: {
      findUnique: vi.fn(async ({ where }: { where: { id?: string; email?: string } }) => {
        if (where.email) {
          const row = [...identities.values()].find((item) => item.email === where.email);
          if (!row) return null;
          return {
            ...row,
            createdAt: new Date(),
            updatedAt: new Date(),
            credentials: [],
            externalIdentities: [],
            refreshSessions: [],
            roles: [],
          };
        }
        return null;
      }),
      findMany: vi.fn().mockResolvedValue([]),
      upsert: vi.fn(async ({ create }: { create: { id: string; email: string } }) => {
        identities.set(create.id, {
          id: create.id,
          email: create.email,
          status: 'ACTIVE',
          disabled: false,
        });
        return create;
      }),
    },
    credential: { upsert: vi.fn() },
    identityRole: { findMany: vi.fn().mockResolvedValue([]), create: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), groupBy: vi.fn().mockResolvedValue([]) },
    refreshSession: { upsert: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), updateMany: vi.fn() },
    role: { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn(), upsert: vi.fn(), delete: vi.fn() },
    permission: { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn(), upsert: vi.fn(), findFirst: vi.fn() },
    rolePermission: { deleteMany: vi.fn(), createMany: vi.fn() },
    passwordResetToken: {
      findFirst: vi.fn(),
      upsert: vi.fn(),
      updateMany: vi.fn(),
    },
    auditLog: { create: vi.fn() },
    outboxMessage: { createMany: vi.fn() },
  };
}

describe('Identity API', () => {
  let app: INestApplication;

  beforeAll(async () => {
    applyTestEnvironment();

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(createIdentityPrismaMock())
      .overrideProvider(RedisCacheService)
      .useValue(createMockRedisCacheService())
      .overrideProvider(OpenSearchClientService)
      .useValue(createMockOpenSearchClientService())
      .overrideProvider(MinioStorageService)
      .useValue(createMockMinioStorageService())
      .overrideProvider(HealthProbeService)
      .useValue(createMockHealthProbeService())
      .overrideProvider(RedisLifecycleService)
      .useValue({ onModuleInit: async () => undefined, onModuleDestroy: async () => undefined })
      .overrideProvider(MinioLifecycleService)
      .useValue({ onModuleInit: async () => undefined })
      .overrideProvider(OpenSearchLifecycleService)
      .useValue({ onModuleDestroy: async () => undefined })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix(API_V1_PREFIX, {
      exclude: ['health', 'health/live', 'health/ready', 'ready', 'openapi.json', 'docs'],
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/v1/auth/register validates DTO', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'invalid', password: 'short' });

    expect(response.status).toBe(400);
  });

  it('POST /api/v1/auth/register creates identity', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'user@example.com', password: 'password123' });

    expect(response.status).toBe(201);
    expect(response.body.data.email).toBe('user@example.com');
  });

  it('POST /api/v1/auth/login returns 401 for invalid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'missing@example.com', password: 'password12345' });

    expect(response.status).toBe(401);
  });

  it('POST /api/v1/auth/forgot-password returns generic message', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'missing@example.com' });

    expect(response.status).toBe(200);
    expect(response.body.data.message).toContain('If the account exists');
  });
});
