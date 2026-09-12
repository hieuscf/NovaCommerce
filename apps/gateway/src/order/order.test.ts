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

type OrderRow = {
  id: string;
  orderNumber: string;
  customerId: string;
  status: string;
  totalAmount: number;
  totalCurrency: string;
  createdAt: Date;
  updatedAt: Date;
  lines: Array<{
    id: string;
    orderId: string;
    productId: string;
    variantId: string | null;
    quantity: number;
    unitPriceAmount: number;
    unitPriceCurrency: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
};

function createOrderPrismaMock() {
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
  const orders = new Map<string, OrderRow>();
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
    userAddress: { findMany: vi.fn().mockResolvedValue([]), upsert: vi.fn(), delete: vi.fn() },
    userPreference: { findMany: vi.fn().mockResolvedValue([]), upsert: vi.fn(), delete: vi.fn() },
    order: {
      upsert: vi.fn(async ({ where, create, update }: { where: { id: string }; create: OrderRow; update: Partial<OrderRow> }) => {
        const existing = orders.get(where.id);
        if (existing) {
          Object.assign(existing, update, { updatedAt: new Date() });
          return existing;
        }
        orders.set(create.id, { ...create, lines: create.lines ?? [] });
        return orders.get(where.id);
      }),
    },
    orderLine: {
      findMany: vi.fn(async ({ where }: { where: { orderId: string } }) => {
        const order = orders.get(where.orderId);
        return order?.lines ?? [];
      }),
      upsert: vi.fn(async ({ create }: { create: OrderRow['lines'][number] }) => {
        const order = orders.get(create.orderId);
        if (!order) {
          throw new Error('Order not found');
        }
        order.lines.push(create);
        return create;
      }),
      delete: vi.fn(),
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
    order: {
      findUnique: vi.fn(async ({ where }: { where: { id?: string; orderNumber?: string } }) => {
        if (where.id) {
          return orders.get(where.id) ?? null;
        }
        if (where.orderNumber) {
          return [...orders.values()].find((order) => order.orderNumber === where.orderNumber) ?? null;
        }
        return null;
      }),
      findMany: vi.fn(async ({ where, skip, take }: { where: { customerId: string; status?: string }; skip: number; take: number }) => {
        let rows = [...orders.values()].filter((order) => order.customerId === where.customerId);
        if (where.status) {
          rows = rows.filter((order) => order.status === where.status);
        }
        rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return rows.slice(skip, skip + take);
      }),
      count: vi.fn(async ({ where }: { where: { customerId: string; status?: string } }) => {
        let rows = [...orders.values()].filter((order) => order.customerId === where.customerId);
        if (where.status) {
          rows = rows.filter((order) => order.status === where.status);
        }
        return rows.length;
      }),
      upsert: tx.order.upsert,
    },
    orderLine: tx.orderLine,
    outboxMessage: tx.outboxMessage,
    cart: { findUnique: vi.fn(), findFirst: vi.fn(), upsert: vi.fn() },
    cartItem: { findMany: vi.fn(), upsert: vi.fn(), delete: vi.fn() },
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
    checkoutSession: { findUnique: vi.fn(), upsert: vi.fn() },
    coupon: { findUnique: vi.fn(), upsert: vi.fn() },
    promotion: { findUnique: vi.fn(), upsert: vi.fn() },
    _orders: orders,
    _users: users,
    _outboxMessages: outboxMessages,
  };
}

describe('Order API', () => {
  let app: INestApplication;
  let jwtAuthService: JwtAuthService;
  let prismaMock: ReturnType<typeof createOrderPrismaMock>;

  beforeAll(async () => {
    applyTestEnvironment();
    prismaMock = createOrderPrismaMock();

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

  async function seedOrder(customerId: string) {
    const orderId = '11111111-1111-1111-1111-111111111111';
    const now = new Date();
    prismaMock._orders.set(orderId, {
      id: orderId,
      orderNumber: 'ORD-TEST001',
      customerId,
      status: 'pending',
      totalAmount: 99.99,
      totalCurrency: 'USD',
      createdAt: now,
      updatedAt: now,
      lines: [
        {
          id: '33333333-3333-3333-3333-333333333333',
          orderId,
          productId: '44444444-4444-4444-4444-444444444444',
          variantId: null,
          quantity: 1,
          unitPriceAmount: 99.99,
          unitPriceCurrency: 'USD',
          createdAt: now,
          updatedAt: now,
        },
      ],
    });
    return orderId;
  }

  it('GET /api/v1/users/me/orders returns 401 without token', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/users/me/orders');
    expect(response.status).toBe(401);
  });

  it('supports order query, history, and cancellation', async () => {
    const token = jwtAuthService.createAccessToken(TEST_USER);
    await ensureProfile(token);

    const user = [...prismaMock._users.values()].find((row) => row.identityId === TEST_USER.userId);
    expect(user).toBeDefined();

    const orderId = await seedOrder(user!.id);

    const history = await request(app.getHttpServer())
      .get('/api/v1/users/me/orders')
      .set('Authorization', `Bearer ${token}`);
    expect(history.status).toBe(200);
    expect(history.body.data.items).toHaveLength(1);

    const detail = await request(app.getHttpServer())
      .get(`/api/v1/users/me/orders/${orderId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(detail.status).toBe(200);
    expect(detail.body.data.orderNumber).toBe('ORD-TEST001');

    const cancel = await request(app.getHttpServer())
      .post(`/api/v1/users/me/orders/${orderId}/cancel`)
      .set('Authorization', `Bearer ${token}`);
    expect(cancel.status).toBe(200);
    expect(cancel.body.data.status).toBe('cancelled');
    expect(prismaMock._outboxMessages.length).toBeGreaterThan(0);
  });
});
