import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InfrastructureError, type ILogger, type ISearchClient } from '@novacommerce/building-blocks';
import { ProductSearchDocument } from '../../domain/entities/product-search-document';
import { PRODUCT_SEARCH_MAPPINGS } from './product-search-mapping';
import { PRODUCT_SEARCH_INDEX } from './product-search-index-name';
import { PRODUCT_SEARCH_SETTINGS } from './product-search-settings';
import { OpenSearchProductSearchIndex } from './opensearch-product-search-index';

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

describe('OpenSearchProductSearchIndex', () => {
  let searchClient: {
    indexExists: ReturnType<typeof vi.fn>;
    createIndex: ReturnType<typeof vi.fn>;
    indexDocument: ReturnType<typeof vi.fn>;
    updateDocument: ReturnType<typeof vi.fn>;
    deleteDocument: ReturnType<typeof vi.fn>;
    search: ReturnType<typeof vi.fn>;
  };
  let logger: ILogger;
  let index: OpenSearchProductSearchIndex;

  beforeEach(() => {
    searchClient = {
      indexExists: vi.fn(),
      createIndex: vi.fn(),
      indexDocument: vi.fn(),
      updateDocument: vi.fn(),
      deleteDocument: vi.fn(),
      search: vi.fn(),
    };
    logger = createLogger();
    index = new OpenSearchProductSearchIndex(searchClient as unknown as ISearchClient, logger);
  });

  it('creates the product search index with mapping and settings', async () => {
    searchClient.indexExists.mockResolvedValue(false);
    searchClient.createIndex.mockResolvedValue(undefined);

    await index.ensureIndex();

    expect(searchClient.createIndex).toHaveBeenCalledWith(
      PRODUCT_SEARCH_INDEX,
      PRODUCT_SEARCH_MAPPINGS,
      PRODUCT_SEARCH_SETTINGS,
    );
    expect(logger.info).toHaveBeenCalledWith(
      'Product search index created',
      expect.objectContaining({
        module: 'search',
        operation: 'create-index',
        index: PRODUCT_SEARCH_INDEX,
      }),
    );
  });

  it('does not fail when the index already exists', async () => {
    searchClient.indexExists.mockResolvedValue(true);

    await index.ensureIndex();

    expect(searchClient.createIndex).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      'Product search index already exists',
      expect.objectContaining({ module: 'search', operation: 'create-index' }),
    );
  });

  it('treats a concurrent already-exists error as success', async () => {
    searchClient.indexExists.mockResolvedValue(false);
    searchClient.createIndex.mockRejectedValue(
      new InfrastructureError('OpenSearch create index failed', 'SEARCH_ERROR', {
        body: { error: { type: 'resource_already_exists_exception' } },
      }),
    );

    await expect(index.ensureIndex()).resolves.toBeUndefined();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('indexes, updates, and deletes product search documents', async () => {
    const document = createDocument();

    await index.indexDocument(document);
    await index.updateDocument(document);
    await index.deleteDocument(document.id);

    expect(searchClient.indexDocument).toHaveBeenCalledWith({
      index: PRODUCT_SEARCH_INDEX,
      id: document.id,
      document: expect.objectContaining({
        id: document.id,
        slug: 'nova-headphones',
        name: 'Nova Headphones',
        price: 99.99,
        currency: 'USD',
        createdAt: '2026-01-01T00:00:00.000Z',
      }),
    });
    expect(searchClient.updateDocument).toHaveBeenCalledWith(
      expect.objectContaining({ index: PRODUCT_SEARCH_INDEX, id: document.id }),
    );
    expect(searchClient.deleteDocument).toHaveBeenCalledWith({
      index: PRODUCT_SEARCH_INDEX,
      id: document.id,
    });
  });

  it('ignores missing documents on delete', async () => {
    searchClient.deleteDocument.mockRejectedValue(
      new InfrastructureError('OpenSearch delete document failed', 'SEARCH_ERROR', { statusCode: 404 }),
    );

    await expect(index.deleteDocument('missing-id')).resolves.toBeUndefined();
  });

  it('searches through ISearchClient and maps hits', async () => {
    const document = createDocument();
    searchClient.search.mockResolvedValue({
      total: 1,
      hits: [
        {
          id: document.id,
          score: 1.2,
          source: {
            id: document.id,
            slug: document.slug,
            name: document.name,
            status: document.status,
            price: document.price,
            currency: document.currency,
            createdAt: document.createdAt.toISOString(),
            updatedAt: document.updatedAt.toISOString(),
            categories: [],
            images: [],
            attributes: [],
            tags: [],
          },
        },
      ],
    });

    const result = await index.search({
      query: 'headphones',
      sort: 'price_asc',
      page: 2,
      pageSize: 20,
    });

    expect(searchClient.search).toHaveBeenCalledWith({
      index: PRODUCT_SEARCH_INDEX,
      query: expect.objectContaining({ bool: expect.any(Object) }),
      sort: [{ price: { order: 'asc' } }, { id: { order: 'asc' } }],
      from: 20,
      size: 20,
    });
    expect(result.total).toBe(1);
    expect(result.items[0]?.id).toBe(document.id);
  });

  it('rethrows search infrastructure failures', async () => {
    searchClient.search.mockRejectedValue(
      new InfrastructureError('OpenSearch search failed', 'SEARCH_ERROR'),
    );

    await expect(
      index.search({ sort: 'createdAt_desc', page: 1, pageSize: 20 }),
    ).rejects.toMatchObject({ code: 'SEARCH_ERROR' });
    expect(logger.error).toHaveBeenCalled();
  });
});
