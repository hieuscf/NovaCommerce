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

type CartRow = {
  id: string;
  customerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    cartId: string;
    productId: string;
    variantId: string | null;
    quantity: number;
    unitPriceAmount: number;
    unitPriceCurrency: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
};

function createCartPrismaMock() {
  const users = new Map<string, {
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
    addresses: unknown[];
    preferences: unknown[];
  }>();
  const carts = new Map<string, CartRow>();
  const outboxMessages: unknown[] = [];

  const findUserByIdentity = (identityId: string) =>
    [...users.values()].find((user) => user.identityId === identityId) ?? null;

  const tx = {
    user: {
      upsert: vi.fn(async ({ where, create }: { where: { id: string }; create: { id: string; identityId: string } }) => {
        const existing = users.get(where.id);
        if (existing) {
          return existing;
        }
        const now = new Date();
        const row = {
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
          create: {
            id: string;
            userId: string;
            displayName: string;
            phoneNumber: string | null;
            avatarUrl: string | null;
          };
          update: Partial<{
            displayName: string;
            phoneNumber: string | null;
            avatarUrl: string | null;
          }>;
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
          return user.profile;
        },
      ),
    },
    userAddress: {
      findMany: vi.fn().mockResolvedValue([]),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    userPreference: {
      findMany: vi.fn().mockResolvedValue([]),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    cart: {
      upsert: vi.fn(async ({ where, create, update }: { where: { id: string }; create: CartRow; update: Partial<CartRow> }) => {
        const existing = carts.get(where.id);
        if (existing) {
          Object.assign(existing, update, { updatedAt: new Date() });
          return existing;
        }
        carts.set(create.id, { ...create, items: create.items ?? [] });
        return carts.get(where.id);
      }),
    },
    cartItem: {
      findMany: vi.fn(async ({ where }: { where: { cartId: string } }) => {
        const cart = carts.get(where.cartId);
        return cart?.items ?? [];
      }),
      upsert: vi.fn(async ({ where, create, update }: { where: { id: string }; create: CartRow['items'][number]; update: Partial<CartRow['items'][number]> }) => {
        const cart = carts.get(create.cartId);
        if (!cart) {
          throw new Error('Cart not found');
        }
        const index = cart.items.findIndex((item) => item.id === where.id);
        if (index >= 0) {
          cart.items[index] = { ...cart.items[index]!, ...update, updatedAt: new Date() };
          return cart.items[index];
        }
        cart.items.push(create);
        return create;
      }),
      delete: vi.fn(async ({ where }: { where: { id: string } }) => {
        for (const cart of carts.values()) {
          cart.items = cart.items.filter((item) => item.id !== where.id);
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
        if (where.identityId) {
          return findUserByIdentity(where.identityId);
        }
        if (where.id) {
          return users.get(where.id) ?? null;
        }
        return null;
      }),
      upsert: tx.user.upsert,
    },
    userProfile: tx.userProfile,
    userAddress: tx.userAddress,
    userPreference: tx.userPreference,
    cart: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => carts.get(where.id) ?? null),
      findFirst: vi.fn(async ({ where }: { where: { customerId: string } }) =>
        [...carts.values()].find((cart) => cart.customerId === where.customerId) ?? null,
      ),
      upsert: tx.cart.upsert,
    },
    cartItem: tx.cartItem,
    outboxMessage: tx.outboxMessage,
    identity: { findUnique: vi.fn(), upsert: vi.fn() },
    credential: { upsert: vi.fn() },
    identityRole: { findMany: vi.fn().mockResolvedValue([]), create: vi.fn(), delete: vi.fn(), deleteMany: vi.fn() },
    refreshSession: { upsert: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), updateMany: vi.fn() },
    role: { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn(), upsert: vi.fn() },
    permission: { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn(), upsert: vi.fn(), findFirst: vi.fn() },
    rolePermission: { deleteMany: vi.fn(), createMany: vi.fn() },
    passwordResetToken: { findFirst: vi.fn(), upsert: vi.fn(), updateMany: vi.fn() },
    auditLog: { create: vi.fn() },
    inventoryItem: { findUnique: vi.fn(), findMany: vi.fn(), upsert: vi.fn() },
    stockReservation: { findMany: vi.fn().mockResolvedValue([]), upsert: vi.fn(), delete: vi.fn() },
    stockAdjustment: { findMany: vi.fn().mockResolvedValue([]), upsert: vi.fn(), delete: vi.fn() },
    product: { findUnique: vi.fn(), findMany: vi.fn(), upsert: vi.fn(), count: vi.fn().mockResolvedValue(0) },
    category: { findUnique: vi.fn(), findMany: vi.fn(), upsert: vi.fn() },
    _carts: carts,
    _users: users,
    _outboxMessages: outboxMessages,
  };
}

describe('Cart API', () => {
  let app: INestApplication;
  let jwtAuthService: JwtAuthService;
  let prismaMock: ReturnType<typeof createCartPrismaMock>;

  beforeAll(async () => {
    applyTestEnvironment();
    prismaMock = createCartPrismaMock();

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

  async function ensureProfile(token: string) {
    await request(app.getHttpServer())
      .post('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ displayName: 'Jane Doe' });
  }

  it('GET /api/v1/users/me/cart returns 401 without token', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/users/me/cart');
    expect(response.status).toBe(401);
  });

  it('supports cart item lifecycle', async () => {
    const token = jwtAuthService.createAccessToken(TEST_USER);
    await ensureProfile(token);

    const productId = '550e8400-e29b-41d4-a716-446655440010';

    const emptyCart = await request(app.getHttpServer())
      .get('/api/v1/users/me/cart')
      .set('Authorization', `Bearer ${token}`);
    expect(emptyCart.status).toBe(200);
    expect(emptyCart.body.data.items).toEqual([]);

    const addItem = await request(app.getHttpServer())
      .post('/api/v1/users/me/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId,
        quantity: 2,
        unitPriceAmount: 19.99,
        unitPriceCurrency: 'USD',
      });
    expect(addItem.status).toBe(201);
    expect(addItem.body.data.items).toHaveLength(1);

    const itemId = addItem.body.data.items[0].id as string;

    const updateItem = await request(app.getHttpServer())
      .patch(`/api/v1/users/me/cart/items/${itemId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 4 });
    expect(updateItem.status).toBe(200);
    expect(updateItem.body.data.items[0].quantity).toBe(4);

    const removeItem = await request(app.getHttpServer())
      .delete(`/api/v1/users/me/cart/items/${itemId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(removeItem.status).toBe(200);
    expect(removeItem.body.data.items).toHaveLength(0);

    await request(app.getHttpServer())
      .post('/api/v1/users/me/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId,
        quantity: 1,
        unitPriceAmount: 19.99,
        unitPriceCurrency: 'USD',
      });

    const clearCart = await request(app.getHttpServer())
      .delete('/api/v1/users/me/cart')
      .set('Authorization', `Bearer ${token}`);
    expect(clearCart.status).toBe(200);
    expect(clearCart.body.data.items).toHaveLength(0);
    expect(prismaMock._outboxMessages.length).toBeGreaterThan(0);
  });
});
