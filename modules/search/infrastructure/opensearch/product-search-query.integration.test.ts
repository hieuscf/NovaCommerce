import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { OpenSearchClientService } from '@novacommerce/infrastructure';
import { ProductSearchDocument, type ProductSearchDocumentProps } from '../../domain/entities/product-search-document';
import { ConsoleLogger } from '../logging/console-logger';
import { OpenSearchProductSearchIndex } from './opensearch-product-search-index';
import { PRODUCT_SEARCH_INDEX } from './product-search-index-name';

const openSearchUrl = process.env.INTEGRATION_OPENSEARCH_URL;
const describeIfOpenSearch = openSearchUrl ? describe : describe.skip;

function document(overrides: Partial<ProductSearchDocumentProps> = {}) {
  return ProductSearchDocument.create({
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'nova-headphones',
    name: 'Nova Headphones',
    description: 'Wireless over-ear headphones',
    status: 'published',
    brand: { id: '33333333-3333-3333-3333-333333333333', name: 'Nova Audio' },
    categories: [{ id: '44444444-4444-4444-4444-444444444444', name: 'Headphones' }],
    price: 99.99,
    currency: 'USD',
    tags: ['audio'],
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    ...overrides,
  }).getValue();
}

describeIfOpenSearch('OpenSearch product search query (integration)', () => {
  let client: OpenSearchClientService;
  let index: OpenSearchProductSearchIndex;
  const testIndexName = `${PRODUCT_SEARCH_INDEX}-query-it`;

  beforeAll(async () => {
    client = new OpenSearchClientService({ url: openSearchUrl as string });
    index = new OpenSearchProductSearchIndex(client, new ConsoleLogger({ module: 'search' }), testIndexName);

    if (await client.indexExists(testIndexName)) {
      await client.deleteIndex(testIndexName);
    }

    await index.ensureIndex();
    await index.indexDocument(document());
    await index.indexDocument(
      document({
        id: '22222222-2222-2222-2222-222222222222',
        slug: 'budget-earbuds',
        name: 'Budget Earbuds',
        description: 'Wired earbuds',
        price: 19.99,
        createdAt: new Date('2026-01-03T00:00:00.000Z'),
      }),
    );
    await refreshIndex();
  });

  afterAll(async () => {
    if (await client.indexExists(testIndexName)) {
      await client.deleteIndex(testIndexName);
    }

    await client.close();
  });

  it('supports keyword, filtering, sorting, pagination, combined query, and empty results', async () => {
    const keyword = await index.search({
      query: 'headphones',
      sort: 'relevance',
      page: 1,
      pageSize: 20,
    });
    expect(keyword.items.map((item) => item.id)).toContain('11111111-1111-1111-1111-111111111111');

    const filtered = await index.search({
      categoryId: '44444444-4444-4444-4444-444444444444',
      brandId: '33333333-3333-3333-3333-333333333333',
      status: 'published',
      minPrice: 50,
      maxPrice: 150,
      sort: 'price_asc',
      page: 1,
      pageSize: 20,
    });
    expect(filtered.items).toHaveLength(1);
    expect(filtered.items[0]?.id).toBe('11111111-1111-1111-1111-111111111111');

    const sorted = await index.search({
      sort: 'price_asc',
      page: 1,
      pageSize: 20,
    });
    expect(sorted.items.map((item) => item.price)).toEqual([19.99, 99.99]);

    const page1 = await index.search({ sort: 'price_asc', page: 1, pageSize: 1 });
    const page2 = await index.search({ sort: 'price_asc', page: 2, pageSize: 1 });
    expect(page1.total).toBe(2);
    expect(page1.items[0]?.price).toBe(19.99);
    expect(page2.items[0]?.price).toBe(99.99);

    const combined = await index.search({
      query: 'headphones',
      status: 'published',
      minPrice: 80,
      sort: 'price_desc',
      page: 1,
      pageSize: 10,
    });
    expect(combined.items).toHaveLength(1);

    const empty = await index.search({
      query: 'no-such-product-xyz',
      sort: 'relevance',
      page: 1,
      pageSize: 20,
    });
    expect(empty.total).toBe(0);
    expect(empty.items).toEqual([]);
  });

  async function refreshIndex(): Promise<void> {
    const response = await fetch(`${openSearchUrl as string}/${testIndexName}/_refresh`, {
      method: 'POST',
    });
    expect(response.ok).toBe(true);
  }
});
