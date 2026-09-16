import { describe, expect, it, vi } from 'vitest';
import { InfrastructureError, type ILogger } from '@novacommerce/building-blocks';
import type { IProductSearchIndex } from '../../domain/repositories/i-product-search-index';
import type { ProductSearchIndexContract } from '../contracts/product-search-event.contract';
import { ProductIndexer } from './product-indexer';

const PRODUCT_ID = '11111111-1111-1111-1111-111111111111';
const INDEX_NAME = 'novacommerce-products';

function createContract(overrides: Partial<ProductSearchIndexContract> = {}): ProductSearchIndexContract {
  return {
    productId: PRODUCT_ID,
    eventId: 'evt-1',
    name: 'Nova Headphones',
    slug: 'nova-headphones',
    status: 'draft',
    price: 99.99,
    currency: 'USD',
    images: ['https://cdn.example/headphones.jpg'],
    attributes: [{ name: 'color', value: 'black' }],
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

function createLogger(): ILogger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

function createIndex(): IProductSearchIndex {
  return {
    ensureIndex: vi.fn(),
    indexDocument: vi.fn().mockResolvedValue(undefined),
    updateDocument: vi.fn().mockResolvedValue(undefined),
    deleteDocument: vi.fn(),
  };
}

describe('ProductIndexer', () => {
  it('indexes ProductCreated as a ProductSearchDocument with a deterministic product id', async () => {
    const productSearchIndex = createIndex();
    const logger = createLogger();
    const indexer = new ProductIndexer(productSearchIndex, logger, INDEX_NAME);

    await indexer.indexProduct(createContract());

    expect(productSearchIndex.indexDocument).toHaveBeenCalledTimes(1);
    const document = vi.mocked(productSearchIndex.indexDocument).mock.calls[0][0];
    expect(document.id).toBe(PRODUCT_ID);
    expect(document.name).toBe('Nova Headphones');
    expect(document.slug).toBe('nova-headphones');
    expect(document.status).toBe('draft');
    expect(document.price).toBe(99.99);
    expect(document.currency).toBe('USD');
    expect(document.images).toEqual(['https://cdn.example/headphones.jpg']);
    expect(document.attributes).toEqual([{ name: 'color', value: 'black' }]);
    expect(logger.info).toHaveBeenCalledWith(
      'Product index started',
      expect.objectContaining({
        module: 'search',
        productId: PRODUCT_ID,
        index: INDEX_NAME,
        operation: 'index',
      }),
    );
  });

  it('updates ProductUpdated against the same document id', async () => {
    const productSearchIndex = createIndex();
    const indexer = new ProductIndexer(productSearchIndex, createLogger(), INDEX_NAME);

    await indexer.updateProduct(
      createContract({
        name: 'Nova Headphones Pro',
        status: 'published',
        price: 129.99,
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      }),
    );

    expect(productSearchIndex.updateDocument).toHaveBeenCalledTimes(1);
    const document = vi.mocked(productSearchIndex.updateDocument).mock.calls[0][0];
    expect(document.id).toBe(PRODUCT_ID);
    expect(document.name).toBe('Nova Headphones Pro');
    expect(document.status).toBe('published');
    expect(document.price).toBe(129.99);
  });

  it('is idempotent: repeated ProductCreated uses the same document id', async () => {
    const productSearchIndex = createIndex();
    const indexer = new ProductIndexer(productSearchIndex, createLogger(), INDEX_NAME);
    const contract = createContract();

    await indexer.indexProduct(contract);
    await indexer.indexProduct(contract);

    expect(productSearchIndex.indexDocument).toHaveBeenCalledTimes(2);
    expect(vi.mocked(productSearchIndex.indexDocument).mock.calls[0][0].id).toBe(PRODUCT_ID);
    expect(vi.mocked(productSearchIndex.indexDocument).mock.calls[1][0].id).toBe(PRODUCT_ID);
  });

  it('is idempotent: repeated ProductUpdated uses the same document id', async () => {
    const productSearchIndex = createIndex();
    const indexer = new ProductIndexer(productSearchIndex, createLogger(), INDEX_NAME);
    const contract = createContract({ name: 'Nova Headphones Pro', status: 'published' });

    await indexer.updateProduct(contract);
    await indexer.updateProduct(contract);

    expect(productSearchIndex.updateDocument).toHaveBeenCalledTimes(2);
    expect(vi.mocked(productSearchIndex.updateDocument).mock.calls[0][0].id).toBe(PRODUCT_ID);
    expect(vi.mocked(productSearchIndex.updateDocument).mock.calls[1][0].id).toBe(PRODUCT_ID);
  });

  it('propagates OpenSearch failures so the event can be retried', async () => {
    const productSearchIndex = createIndex();
    vi.mocked(productSearchIndex.indexDocument).mockRejectedValue(
      new InfrastructureError('OpenSearch index document failed', 'SEARCH_ERROR'),
    );
    const indexer = new ProductIndexer(productSearchIndex, createLogger(), INDEX_NAME);

    await expect(indexer.indexProduct(createContract())).rejects.toMatchObject({
      code: 'SEARCH_ERROR',
    });
  });
});
