import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AppModule } from '../app.module';
import { JwtAuthService } from '../auth/jwt-auth.service';
import { API_V1_PREFIX } from '../common/constants';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { TEST_USER } from '../test/auth-test-utils';
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

type UserRow = {
  id: string;
  identityId: string;
  createdAt: Date;
  updatedAt: Date;
  profile: {
    id: string;
    userId: string;
    displayName: string;
    phoneNumber: string | null;
    avatarUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  addresses: Array<{
    id: string;
    userId: string;
    label: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
  preferences: Array<{
    id: string;
    userId: string;
    key: string;
    value: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
};

function createUserPrismaMock() {
  const users = new Map<string, UserRow>();
  const outboxMessages: unknown[] = [];

  const findUser = (where: { id?: string; identityId?: string }) => {
    if (where.id) {
      return users.get(where.id) ?? null;
    }
    if (where.identityId) {
      return [...users.values()].find((user) => user.identityId === where.identityId) ?? null;
    }
    return null;
  };

  const tx = {
    user: {
      upsert: vi.fn(async ({ where, create }: { where: { id: string }; create: { id: string; identityId: string } }) => {
        const existing = users.get(where.id);
        if (existing) {
          return existing;
        }
        const now = new Date();
        const row: UserRow = {
          id: create.id,
          identityId: create.identityId,
          createdAt: now,
          updatedAt: now,
          profile: null,
          addresses: [],
          preferences: [],
        };
        users.set(create.id, row);
        return row;
      }),
    },
    userProfile: {
      upsert: vi.fn(
        async ({
          where,
          create,
          update,
        }: {
          where: { userId: string };
          create: NonNullable<UserRow['profile']>;
          update: Partial<NonNullable<UserRow['profile']>>;
        }) => {
          const user = users.get(where.userId);
          if (!user) {
            throw new Error('User not found');
          }
          const now = new Date();
          if (!user.profile) {
            user.profile = {
              ...create,
              userId: where.userId,
              createdAt: now,
              updatedAt: now,
            };
          } else {
            user.profile = {
              ...user.profile,
              ...update,
              updatedAt: now,
            };
          }
          user.updatedAt = now;
          return user.profile;
        },
      ),
    },
    userAddress: {
      findMany: vi.fn(async ({ where }: { where: { userId: string } }) => {
        const user = users.get(where.userId);
        return user?.addresses ?? [];
      }),
      upsert: vi.fn(
        async ({
          where,
          create,
          update,
        }: {
          where: { id: string };
          create: UserRow['addresses'][number];
          update: Partial<UserRow['addresses'][number]>;
        }) => {
          const user = [...users.values()].find((item) => item.id === create.userId);
          if (!user) {
            throw new Error('User not found');
          }
          const index = user.addresses.findIndex((item) => item.id === where.id);
          if (index >= 0) {
            user.addresses[index] = { ...user.addresses[index]!, ...update, updatedAt: new Date() };
            return user.addresses[index];
          }
          user.addresses.push(create);
          return create;
        },
      ),
      delete: vi.fn(async ({ where }: { where: { id: string } }) => {
        for (const user of users.values()) {
          user.addresses = user.addresses.filter((item) => item.id !== where.id);
        }
      }),
    },
    userPreference: {
      findMany: vi.fn(async ({ where }: { where: { userId: string } }) => {
        const user = users.get(where.userId);
        return user?.preferences ?? [];
      }),
      upsert: vi.fn(
        async ({
          where,
          create,
          update,
        }: {
          where: { userId_key: { userId: string; key: string } };
          create: UserRow['preferences'][number];
          update: Partial<UserRow['preferences'][number]>;
        }) => {
          const user = users.get(where.userId_key.userId);
          if (!user) {
            throw new Error('User not found');
          }
          const index = user.preferences.findIndex((item) => item.key === where.userId_key.key);
          if (index >= 0) {
            user.preferences[index] = { ...user.preferences[index]!, ...update, updatedAt: new Date() };
            return user.preferences[index];
          }
          user.preferences.push(create);
          return create;
        },
      ),
      delete: vi.fn(async ({ where }: { where: { id: string } }) => {
        for (const user of users.values()) {
          user.preferences = user.preferences.filter((item) => item.id !== where.id);
        }
      }),
    },
    outboxMessage: {
      createMany: vi.fn(async ({ data }: { data: unknown[] }) => {
        outboxMessages.push(...data);
      }),
    },
  };

  return {
    onModuleInit: async () => undefined,
    onModuleDestroy: async () => undefined,
    ping: async () => undefined,
    $connect: async () => undefined,
    $disconnect: async () => undefined,
    $transaction: async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx),
    user: {
      findUnique: vi.fn(async ({ where }: { where: { id?: string; identityId?: string } }) => {
        const row = findUser(where);
        if (!row) {
          return null;
        }
        return {
          ...row,
          profile: row.profile,
          addresses: row.addresses,
          preferences: row.preferences,
        };
      }),
      upsert: tx.user.upsert,
    },
    userProfile: tx.userProfile,
    userAddress: tx.userAddress,
    userPreference: tx.userPreference,
    outboxMessage: tx.outboxMessage,
    identity: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    credential: { upsert: vi.fn() },
    identityRole: { findMany: vi.fn().mockResolvedValue([]), create: vi.fn(), delete: vi.fn(), deleteMany: vi.fn() },
    refreshSession: { upsert: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), updateMany: vi.fn() },
    role: { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn(), upsert: vi.fn() },
    permission: { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn(), upsert: vi.fn(), findFirst: vi.fn() },
    rolePermission: { deleteMany: vi.fn(), createMany: vi.fn() },
    passwordResetToken: { findFirst: vi.fn(), upsert: vi.fn(), updateMany: vi.fn() },
    auditLog: { create: vi.fn() },
    _users: users,
    _outboxMessages: outboxMessages,
  };
}

describe('User API', () => {
  let app: INestApplication;
  let jwtAuthService: JwtAuthService;
  let prismaMock: ReturnType<typeof createUserPrismaMock>;

  beforeAll(async () => {
    applyTestEnvironment();
    prismaMock = createUserPrismaMock();

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
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

    jwtAuthService = app.get(JwtAuthService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/users/me returns 401 without token', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/users/me');
    expect(response.status).toBe(401);
  });

  it('POST /api/v1/users/me creates profile', async () => {
    const token = jwtAuthService.createAccessToken(TEST_USER);

    const response = await request(app.getHttpServer())
      .post('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ displayName: 'Jane Doe' });

    expect(response.status).toBe(201);
    expect(response.body.data.displayName).toBe('Jane Doe');
    expect(prismaMock._outboxMessages.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/users/me returns profile', async () => {
    const token = jwtAuthService.createAccessToken(TEST_USER);

    const response = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.identityId).toBe(TEST_USER.userId);
  });

  it('PATCH /api/v1/users/me updates profile', async () => {
    const token = jwtAuthService.createAccessToken(TEST_USER);

    const response = await request(app.getHttpServer())
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ displayName: 'John Doe' });

    expect(response.status).toBe(200);
    expect(response.body.data.displayName).toBe('John Doe');
  });

  it('POST /api/v1/users/me/addresses adds address', async () => {
    const token = jwtAuthService.createAccessToken(TEST_USER);

    const response = await request(app.getHttpServer())
      .post('/api/v1/users/me/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        label: 'Home',
        line1: '123 Main St',
        city: 'Hanoi',
        state: 'HN',
        postalCode: '100000',
        country: 'VN',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.isDefault).toBe(true);
  });

  it('PATCH /api/v1/users/me/preferences updates preferences', async () => {
    const token = jwtAuthService.createAccessToken(TEST_USER);

    const response = await request(app.getHttpServer())
      .patch('/api/v1/users/me/preferences')
      .set('Authorization', `Bearer ${token}`)
      .send({ preferences: [{ key: 'language', value: 'vi' }] });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ key: 'language', value: 'vi' })]),
    );
  });
});
