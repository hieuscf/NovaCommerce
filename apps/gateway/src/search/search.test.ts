import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { OpenSearchClientService, RedisCacheService } from '@novacommerce/infrastructure';
import { createTestApp } from '../test/create-test-app';
import { createMockOpenSearchClientService, createMockRedisCacheService } from '../test/infrastructure-test-utils';

const CATEGORY_ID = '550e8400-e29b-41d4-a716-446655440001';
const BRAND_ID = '550e8400-e29b-41d4-a716-446655440002';
const PRODUCT_ID = '550e8400-e29b-41d4-a716-446655440000';

function searchHit() {
  return {
    id: PRODUCT_ID,
    score: 1.4,
    source: {
      id: PRODUCT_ID,
      slug: 'nova-headphones',
      name: 'Nova Headphones',
      description: 'Wireless',
      status: 'published',
      brand: { id: BRAND_ID, name: 'Nova Audio' },
      categories: [{ id: CATEGORY_ID, name: 'Headphones' }],
      price: 99.99,
      currency: 'USD',
      images: ['https://cdn.example/headphones.jpg'],
      attributes: [{ name: 'color', value: 'black' }],
      tags: ['audio'],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    },
  };
}

describe('Search API', () => {
  let app: INestApplication;
  const search = vi.fn(async () => ({ total: 0, hits: [] }));
  const cacheGet = vi.fn(async () => null);
  const cacheSet = vi.fn(async () => undefined);

  beforeAll(async () => {
    const openSearchClient = {
      ...createMockOpenSearchClientService(),
      search,
    } as unknown as OpenSearchClientService;
    const redisCacheService = {
      ...createMockRedisCacheService(),
      get: cacheGet,
      set: cacheSet,
    } as unknown as RedisCacheService;

    app = await createTestApp({
      enableSwagger: true,
      openSearchClient,
      redisCacheService,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/search/products is public and supports empty keyword browse', async () => {
    search.mockResolvedValueOnce({ total: 0, hits: [] });

    const response = await request(app.getHttpServer()).get('/api/v1/search/products');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    });
    expect(search).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 0,
        size: 20,
        query: { match_all: {} },
      }),
    );
  });

  it('parses keyword, filters, sort, and pagination into an OpenSearch query', async () => {
    search.mockResolvedValueOnce({ total: 21, hits: [searchHit()] });

    const response = await request(app.getHttpServer()).get('/api/v1/search/products').query({
      q: 'phone',
      categoryId: CATEGORY_ID,
      brandId: BRAND_ID,
      minPrice: 10,
      maxPrice: 200,
      status: 'published',
      sort: 'price_asc',
      page: 2,
      pageSize: 20,
    });

    expect(response.status).toBe(200);
    expect(response.body.data.page).toBe(2);
    expect(response.body.data.pageSize).toBe(20);
    expect(response.body.data.total).toBe(21);
    expect(response.body.data.totalPages).toBe(2);
    expect(response.body.data.items[0]).toMatchObject({
      id: PRODUCT_ID,
      name: 'Nova Headphones',
      price: 99.99,
      status: 'published',
    });
    expect(search).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 20,
        size: 20,
        sort: [{ price: { order: 'asc' } }, { id: { order: 'asc' } }],
      }),
    );
    const query = search.mock.calls.at(-1)?.[0] as { query: { bool?: { filter?: unknown[] } } };
    expect(query.query.bool?.filter).toEqual(
      expect.arrayContaining([
        { term: { status: 'published' } },
        { term: { 'brand.id': BRAND_ID } },
        { range: { price: { gte: 10, lte: 200 } } },
      ]),
    );
  });

  it('rejects invalid sort, pagination, price range, and unsupported filters', async () => {
    await expect(
      request(app.getHttpServer()).get('/api/v1/search/products').query({ sort: 'popularity' }),
    ).resolves.toMatchObject({ status: 400 });
    await expect(
      request(app.getHttpServer()).get('/api/v1/search/products').query({ page: 0 }),
    ).resolves.toMatchObject({ status: 400 });
    await expect(
      request(app.getHttpServer()).get('/api/v1/search/products').query({ pageSize: 101 }),
    ).resolves.toMatchObject({ status: 400 });
    await expect(
      request(app.getHttpServer()).get('/api/v1/search/products').query({ minPrice: 50, maxPrice: 10 }),
    ).resolves.toMatchObject({ status: 400 });
    await expect(
      request(app.getHttpServer()).get('/api/v1/search/products').query({ availability: 'in_stock' }),
    ).resolves.toMatchObject({ status: 400 });
  });

  it('documents the search endpoint in OpenAPI', async () => {
    const response = await request(app.getHttpServer()).get('/openapi.json');

    expect(response.status).toBe(200);
    expect(response.body.paths['/api/v1/search/products']).toBeDefined();
    expect(response.body.paths['/api/v1/search/products'].get.parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'q' }),
        expect.objectContaining({ name: 'categoryId' }),
        expect.objectContaining({ name: 'sort' }),
        expect.objectContaining({ name: 'page' }),
        expect.objectContaining({ name: 'pageSize' }),
      ]),
    );
  });
});
