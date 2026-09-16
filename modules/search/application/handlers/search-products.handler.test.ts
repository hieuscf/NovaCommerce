import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ICache, ILogger } from '@novacommerce/building-blocks';
import { InfrastructureError } from '@novacommerce/building-blocks';
import { ProductSearchDocument } from '../../domain/entities/product-search-document';
import type { IProductSearchIndex } from '../../domain/repositories/i-product-search-index';
import { SearchProductsHandler } from './search-products.handler';

function createDocument() {
  return ProductSearchDocument.create({
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'nova-headphones',
    name: 'Nova Headphones',
    status: 'published',
    price: 99.99,
    currency: 'USD',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  }).getValue();
}

function createLogger(): ILogger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

describe('SearchProductsHandler', () => {
  let productSearchIndex: {
    search: ReturnType<typeof vi.fn>;
  };
  let cache: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
  };
  let logger: ILogger;
  let handler: SearchProductsHandler;

  beforeEach(() => {
    productSearchIndex = {
      search: vi.fn(),
    };
    cache = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
    };
    logger = createLogger();
    handler = new SearchProductsHandler(
      productSearchIndex as unknown as IProductSearchIndex,
      cache as unknown as ICache,
      logger,
      { enabled: true, ttlSeconds: 60 },
    );
  });

  it('searches with keyword, filters, sort, and pagination then caches the result', async () => {
    productSearchIndex.search.mockResolvedValue({
      items: [createDocument()],
      total: 21,
    });

    const result = await handler.execute({
      query: 'phone',
      categoryId: '44444444-4444-4444-4444-444444444444',
      brandId: '33333333-3333-3333-3333-333333333333',
      minPrice: 10,
      maxPrice: 200,
      status: 'published',
      sort: 'price_asc',
      page: 2,
      pageSize: 20,
    });

    expect(result.isSuccess).toBe(true);
    const value = result.getValue();
    expect(value.items).toHaveLength(1);
    expect(value.items[0]?.name).toBe('Nova Headphones');
    expect(value.total).toBe(21);
    expect(value.page).toBe(2);
    expect(value.pageSize).toBe(20);
    expect(value.totalPages).toBe(2);
    expect(productSearchIndex.search).toHaveBeenCalledWith({
      query: 'phone',
      categoryId: '44444444-4444-4444-4444-444444444444',
      brandId: '33333333-3333-3333-3333-333333333333',
      minPrice: 10,
      maxPrice: 200,
      status: 'published',
      sort: 'price_asc',
      page: 2,
      pageSize: 20,
    });
    expect(cache.set).toHaveBeenCalledWith(
      expect.stringMatching(/^search:products:[a-f0-9]{64}$/),
      value,
      60,
    );
  });

  it('returns a cached result without calling OpenSearch', async () => {
    const cached = {
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    };
    cache.get.mockResolvedValue(cached);

    const result = await handler.execute({ query: 'phone', page: 1, pageSize: 20 });

    expect(result.getValue()).toEqual(cached);
    expect(productSearchIndex.search).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
  });

  it('still searches when cache read fails', async () => {
    cache.get.mockRejectedValue(new InfrastructureError('Redis GET failed', 'CACHE_ERROR'));
    productSearchIndex.search.mockResolvedValue({ items: [], total: 0 });

    const result = await handler.execute({ query: 'phone' });

    expect(result.isSuccess).toBe(true);
    expect(productSearchIndex.search).toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      'Search cache read failed',
      expect.objectContaining({ module: 'search', operation: 'cache-get' }),
    );
  });

  it('returns SEARCH_UNAVAILABLE when the search index fails', async () => {
    productSearchIndex.search.mockRejectedValue(
      new InfrastructureError('OpenSearch search failed', 'SEARCH_ERROR'),
    );

    const result = await handler.execute({ query: 'phone' });

    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('SEARCH_UNAVAILABLE');
    expect(cache.set).not.toHaveBeenCalled();
  });

  it('rejects invalid input before searching', async () => {
    const result = await handler.execute({ minPrice: 100, maxPrice: 10 });

    expect(result.getError().code).toBe('INVALID_SEARCH_PRICE_RANGE');
    expect(productSearchIndex.search).not.toHaveBeenCalled();
    expect(cache.get).not.toHaveBeenCalled();
  });
});
