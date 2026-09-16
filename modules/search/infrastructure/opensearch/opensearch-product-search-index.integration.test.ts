import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { OpenSearchClientService } from '@novacommerce/infrastructure';
import { ConsoleLogger } from '../logging/console-logger';
import { PRODUCT_SEARCH_INDEX } from './product-search-index-name';
import { OpenSearchProductSearchIndex } from './opensearch-product-search-index';

const openSearchUrl = process.env.INTEGRATION_OPENSEARCH_URL;
const describeIfOpenSearch = openSearchUrl ? describe : describe.skip;

describeIfOpenSearch('OpenSearchProductSearchIndex (integration)', () => {
  let client: OpenSearchClientService;
  let index: OpenSearchProductSearchIndex;
  const testIndexName = `${PRODUCT_SEARCH_INDEX}-it`;

  beforeAll(async () => {
    client = new OpenSearchClientService({ url: openSearchUrl as string });
    index = new OpenSearchProductSearchIndex(client, new ConsoleLogger({ module: 'search' }), testIndexName);

    if (await client.indexExists(testIndexName)) {
      await client.deleteIndex(testIndexName);
    }
  });

  afterAll(async () => {
    if (await client.indexExists(testIndexName)) {
      await client.deleteIndex(testIndexName);
    }

    await client.close();
  });

  it('creates the product search index and is idempotent when the index exists', async () => {
    await index.ensureIndex();
    await expect(client.indexExists(testIndexName)).resolves.toBe(true);

    await expect(index.ensureIndex()).resolves.toBeUndefined();
    await expect(client.indexExists(testIndexName)).resolves.toBe(true);
  });

  it('applies product search mapping and settings', async () => {
    const mappingResponse = await fetch(`${openSearchUrl as string}/${testIndexName}/_mapping`);
    const mappingBody = (await mappingResponse.json()) as Record<
      string,
      { mappings?: { properties?: Record<string, { type?: string }> } }
    >;
    const properties = mappingBody[testIndexName]?.mappings?.properties;

    expect(mappingResponse.ok).toBe(true);
    expect(properties?.name?.type).toBe('text');
    expect(properties?.status?.type).toBe('keyword');
    expect(properties?.price?.type).toBe('double');
    expect(properties?.createdAt?.type).toBe('date');
    expect(properties?.categories?.type).toBe('nested');

    const settingsResponse = await fetch(`${openSearchUrl as string}/${testIndexName}/_settings`);
    const settingsBody = (await settingsResponse.json()) as Record<
      string,
      {
        settings?: {
          index?: {
            analysis?: { normalizer?: { lowercase_normalizer?: { type?: string } } };
          };
        };
      }
    >;

    expect(settingsResponse.ok).toBe(true);
    expect(
      settingsBody[testIndexName]?.settings?.index?.analysis?.normalizer?.lowercase_normalizer?.type,
    ).toBe('custom');
  });
});
