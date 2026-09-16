import { AvailabilityError } from '@novacommerce/building-blocks';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockClient = {
  cluster: {
    health: vi.fn(async () => ({
      body: {
        status: 'green',
        cluster_name: 'test-cluster',
      },
    })),
  },
  indices: {
    create: vi.fn(async () => ({ body: {} })),
    delete: vi.fn(async () => ({ body: {} })),
    exists: vi.fn(async () => ({ body: true, statusCode: 200 })),
  },
  index: vi.fn(async () => ({ body: {} })),
  update: vi.fn(async () => ({ body: {} })),
  delete: vi.fn(async () => ({ body: {} })),
  search: vi.fn(async () => ({
    body: {
      hits: {
        total: { value: 1 },
        hits: [{ _id: '1', _score: 1.2, _source: { name: 'Product' } }],
      },
    },
  })),
  close: vi.fn(async () => undefined),
};

vi.mock('@opensearch-project/opensearch', () => ({
  Client: vi.fn(() => mockClient),
}));

import { OpenSearchClientService } from './opensearch-client.service';

describe('OpenSearchClientService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns health status', async () => {
    const service = new OpenSearchClientService({ url: 'http://localhost:9200' });

    const health = await service.health();

    expect(health.status).toBe('green');
    expect(health.clusterName).toBe('test-cluster');
  });

  it('indexes, updates, deletes, and searches documents', async () => {
    const service = new OpenSearchClientService({ url: 'http://localhost:9200' });

    await service.createIndex(
      'products',
      { properties: { name: { type: 'text' } } },
      { analysis: { normalizer: { lowercase_normalizer: { type: 'custom', filter: ['lowercase'] } } } },
    );
    await expect(service.indexExists('products')).resolves.toBe(true);
    await service.indexDocument({ index: 'products', id: '1', document: { name: 'A' } });
    await service.updateDocument({ index: 'products', id: '1', document: { name: 'B' } });
    await service.deleteDocument({ index: 'products', id: '1' });

    const result = await service.search({
      index: 'products',
      query: { match_all: {} },
      sort: [{ price: { order: 'asc' } }, { id: { order: 'asc' } }],
      from: 0,
      size: 20,
    });

    expect(mockClient.search).toHaveBeenCalledWith({
      index: 'products',
      from: 0,
      size: 20,
      body: {
        query: { match_all: {} },
        sort: [{ price: { order: 'asc' } }, { id: { order: 'asc' } }],
      },
    });

    expect(mockClient.indices.create).toHaveBeenCalledWith({
      index: 'products',
      body: {
        settings: {
          analysis: {
            normalizer: { lowercase_normalizer: { type: 'custom', filter: ['lowercase'] } },
          },
        },
        mappings: { properties: { name: { type: 'text' } } },
      },
    });
    expect(result.total).toBe(1);
    expect(result.hits[0]?.source.name).toBe('Product');
  });

  it('throws availability error when cluster is red', async () => {
    mockClient.cluster.health.mockResolvedValueOnce({
      body: { status: 'red' },
    });

    const service = new OpenSearchClientService({ url: 'http://localhost:9200' });

    await expect(service.ping()).rejects.toBeInstanceOf(AvailabilityError);
  });
});
