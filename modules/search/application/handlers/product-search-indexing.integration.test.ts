import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { OpenSearchClientService } from '@novacommerce/infrastructure';
import { ConsoleLogger } from '../../infrastructure/logging/console-logger';
import { OpenSearchProductSearchIndex } from '../../infrastructure/opensearch/opensearch-product-search-index';
import { PRODUCT_SEARCH_INDEX } from '../../infrastructure/opensearch/product-search-index-name';
import { ProductCreatedHandler } from './product-created.handler';
import { ProductUpdatedHandler } from './product-updated.handler';
import { ProductIndexer } from '../services/product-indexer';

const openSearchUrl = process.env.INTEGRATION_OPENSEARCH_URL;
const describeIfOpenSearch = openSearchUrl ? describe : describe.skip;
const PRODUCT_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

function snapshot(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Nova Headphones',
    slug: 'nova-headphones',
    status: 'draft',
    price: 99.99,
    currency: 'USD',
    images: ['https://cdn.example/headphones.jpg'],
    attributes: [{ name: 'color', value: 'black' }],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describeIfOpenSearch('Product search indexing (integration)', () => {
  let client: OpenSearchClientService;
  let createdHandler: ProductCreatedHandler;
  let updatedHandler: ProductUpdatedHandler;
  const testIndexName = `${PRODUCT_SEARCH_INDEX}-indexer-it`;

  beforeAll(async () => {
    client = new OpenSearchClientService({ url: openSearchUrl as string });
    const logger = new ConsoleLogger({ module: 'search' });
    const index = new OpenSearchProductSearchIndex(client, logger, testIndexName);
    const indexer = new ProductIndexer(index, logger, testIndexName);
    createdHandler = new ProductCreatedHandler(indexer, logger);
    updatedHandler = new ProductUpdatedHandler(indexer, logger);

    if (await client.indexExists(testIndexName)) {
      await client.deleteIndex(testIndexName);
    }

    await index.ensureIndex();
  });

  afterAll(async () => {
    if (await client.indexExists(testIndexName)) {
      await client.deleteIndex(testIndexName);
    }

    await client.close();
  });

  it('indexes ProductCreated and replaces the same document on ProductUpdated', async () => {
    await createdHandler.handle({
      eventId: 'evt-created-it',
      eventType: 'catalog.product_created',
      eventVersion: 1,
      aggregateId: PRODUCT_ID,
      aggregateType: 'Product',
      occurredAt: '2026-01-01T00:00:00.000Z',
      payload: snapshot(),
    });

    await createdHandler.handle({
      eventId: 'evt-created-it-retry',
      eventType: 'catalog.product_created',
      eventVersion: 1,
      aggregateId: PRODUCT_ID,
      aggregateType: 'Product',
      occurredAt: '2026-01-01T00:00:00.000Z',
      payload: snapshot(),
    });

    await refreshIndex();
    const created = await fetchDocument();
    expect(created.found).toBe(true);
    expect(created._id).toBe(PRODUCT_ID);
    expect(created._source?.name).toBe('Nova Headphones');
    expect(created._source?.status).toBe('draft');
    expect(created._source?.price).toBe(99.99);

    await updatedHandler.handle({
      eventId: 'evt-updated-it',
      eventType: 'catalog.product_updated',
      eventVersion: 1,
      aggregateId: PRODUCT_ID,
      aggregateType: 'Product',
      occurredAt: '2026-01-02T00:00:00.000Z',
      payload: snapshot({
        name: 'Nova Headphones Pro',
        status: 'published',
        price: 129.99,
        updatedAt: '2026-01-02T00:00:00.000Z',
      }),
    });

    await updatedHandler.handle({
      eventId: 'evt-updated-it-retry',
      eventType: 'catalog.product_updated',
      eventVersion: 1,
      aggregateId: PRODUCT_ID,
      aggregateType: 'Product',
      occurredAt: '2026-01-02T00:00:00.000Z',
      payload: snapshot({
        name: 'Nova Headphones Pro',
        status: 'published',
        price: 129.99,
        updatedAt: '2026-01-02T00:00:00.000Z',
      }),
    });

    await refreshIndex();
    const updated = await fetchDocument();
    expect(updated.found).toBe(true);
    expect(updated._id).toBe(PRODUCT_ID);
    expect(updated._source?.name).toBe('Nova Headphones Pro');
    expect(updated._source?.status).toBe('published');
    expect(updated._source?.price).toBe(129.99);

    const countResponse = await fetch(`${openSearchUrl as string}/${testIndexName}/_count`);
    const countBody = (await countResponse.json()) as { count?: number };
    expect(countBody.count).toBe(1);
  });

  async function refreshIndex(): Promise<void> {
    const response = await fetch(`${openSearchUrl as string}/${testIndexName}/_refresh`, {
      method: 'POST',
    });
    expect(response.ok).toBe(true);
  }

  async function fetchDocument(): Promise<{
    found?: boolean;
    _id?: string;
    _source?: { name?: string; status?: string; price?: number };
  }> {
    const response = await fetch(`${openSearchUrl as string}/${testIndexName}/_doc/${PRODUCT_ID}`);
    return (await response.json()) as {
      found?: boolean;
      _id?: string;
      _source?: { name?: string; status?: string; price?: number };
    };
  }
});
