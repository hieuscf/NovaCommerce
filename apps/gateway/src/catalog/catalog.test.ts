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
import { TEST_ADMIN } from '../test/auth-test-utils';
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

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  basePriceAmount: number;
  basePriceCurrency: string;
  status: string;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  variants: unknown[];
  images: unknown[];
  attributes: unknown[];
  options: unknown[];
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function createCatalogPrismaMock() {
  const products = new Map<string, ProductRow>();
  const categories = new Map<string, CategoryRow>();
  const outboxMessages: unknown[] = [];

  const findProduct = (where: { id?: string; slug?: string }) => {
    if (where.id) {
      return products.get(where.id) ?? null;
    }
    if (where.slug) {
      return [...products.values()].find((product) => product.slug === where.slug) ?? null;
    }
    return null;
  };

  const tx = {
    product: {
      upsert: vi.fn(async ({ where, create, update }: {
        where: { id: string };
        create: Omit<ProductRow, 'variants' | 'images' | 'attributes' | 'options'>;
        update: Partial<ProductRow>;
      }) => {
        const existing = products.get(where.id);
        const now = new Date();
        const row: ProductRow = {
          ...(existing ?? {
            id: create.id,
            name: create.name,
            slug: create.slug,
            basePriceAmount: create.basePriceAmount,
            basePriceCurrency: create.basePriceCurrency,
            status: create.status,
            categoryId: create.categoryId,
            createdAt: now,
            updatedAt: now,
            variants: [],
            images: [],
            attributes: [],
            options: [],
          }),
          ...update,
          updatedAt: now,
        };
        products.set(where.id, row);
        return row;
      }),
    },
    productVariant: {
      findMany: vi.fn().mockResolvedValue([]),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    productImage: {
      findMany: vi.fn().mockResolvedValue([]),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    productAttribute: {
      findMany: vi.fn().mockResolvedValue([]),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    productOption: {
      findMany: vi.fn().mockResolvedValue([]),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    category: {
      upsert: vi.fn(async ({ where, create, update }: {
        where: { id: string };
        create: CategoryRow;
        update: Partial<CategoryRow>;
      }) => {
        const existing = categories.get(where.id);
        const now = new Date();
        const row: CategoryRow = {
          ...(existing ?? create),
          ...update,
          updatedAt: now,
        };
        categories.set(where.id, row);
        return row;
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
    product: {
      findUnique: vi.fn(async ({ where }: { where: { id?: string; slug?: string } }) => findProduct(where)),
      findMany: vi.fn(async () => [...products.values()]),
      count: vi.fn(async () => products.size),
      upsert: tx.product.upsert,
    },
    category: {
      findUnique: vi.fn(async ({ where }: { where: { id?: string; slug?: string } }) => {
        if (where.id) {
          return categories.get(where.id) ?? null;
        }
        if (where.slug) {
          return [...categories.values()].find((category) => category.slug === where.slug) ?? null;
        }
        return null;
      }),
      findMany: vi.fn(async () => [...categories.values()]),
      upsert: tx.category.upsert,
    },
    productVariant: tx.productVariant,
    productImage: tx.productImage,
    productAttribute: tx.productAttribute,
    productOption: tx.productOption,
    outboxMessage: tx.outboxMessage,
    user: { findUnique: vi.fn(), upsert: vi.fn() },
    userProfile: { upsert: vi.fn() },
    userAddress: { findMany: vi.fn().mockResolvedValue([]), upsert: vi.fn(), delete: vi.fn() },
    userPreference: { findMany: vi.fn().mockResolvedValue([]), upsert: vi.fn(), delete: vi.fn() },
    identity: { findUnique: vi.fn(), upsert: vi.fn() },
    credential: { upsert: vi.fn() },
    identityRole: { findMany: vi.fn().mockResolvedValue([]), create: vi.fn(), delete: vi.fn(), deleteMany: vi.fn() },
    refreshSession: { upsert: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), updateMany: vi.fn() },
    role: { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn(), upsert: vi.fn() },
    permission: { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn(), upsert: vi.fn(), findFirst: vi.fn() },
    rolePermission: { deleteMany: vi.fn(), createMany: vi.fn() },
    passwordResetToken: { findFirst: vi.fn(), upsert: vi.fn(), updateMany: vi.fn() },
    auditLog: { create: vi.fn() },
    _products: products,
    _categories: categories,
    _outboxMessages: outboxMessages,
  };
}

describe('Catalog API', () => {
  let app: INestApplication;
  let jwtAuthService: JwtAuthService;
  let prismaMock: ReturnType<typeof createCatalogPrismaMock>;

  beforeAll(async () => {
    applyTestEnvironment();
    prismaMock = createCatalogPrismaMock();

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

  it('GET /api/v1/products is public', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/products');
    expect(response.status).toBe(200);
    expect(response.body.data.items).toEqual([]);
  });

  it('POST /api/v1/products requires authentication', async () => {
    const response = await request(app.getHttpServer()).post('/api/v1/products').send({
      name: 'Nova Headphones',
      slug: 'nova-headphones',
      basePriceAmount: 99.99,
      basePriceCurrency: 'USD',
    });
    expect(response.status).toBe(401);
  });

  it('POST /api/v1/products creates product and outbox event', async () => {
    const token = jwtAuthService.createAccessToken(TEST_ADMIN);

    const response = await request(app.getHttpServer())
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Nova Headphones',
        slug: 'nova-headphones',
        basePriceAmount: 99.99,
        basePriceCurrency: 'USD',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.slug).toBe('nova-headphones');
    expect(response.body.data.status).toBe('draft');
    expect(prismaMock._outboxMessages.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/products/:productId returns created product', async () => {
    const token = jwtAuthService.createAccessToken(TEST_ADMIN);
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Nova Speaker',
        slug: 'nova-speaker',
        basePriceAmount: 49.99,
        basePriceCurrency: 'USD',
      });

    const productId = createResponse.body.data.id as string;
    const response = await request(app.getHttpServer()).get(`/api/v1/products/${productId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.slug).toBe('nova-speaker');
  });

  it('POST /api/v1/categories creates category', async () => {
    const token = jwtAuthService.createAccessToken(TEST_ADMIN);

    const response = await request(app.getHttpServer())
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Electronics',
        slug: 'electronics',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.slug).toBe('electronics');
  });
});
