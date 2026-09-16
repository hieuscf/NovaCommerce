import type { ICache, IObjectStorage, ISearchClient } from '@novacommerce/building-blocks';
import {
  HealthProbeService,
  MinioStorageService,
  OpenSearchClientService,
  RedisCacheService,
} from '@novacommerce/infrastructure';

export function createMockRedisCacheService(): RedisCacheService {
  const cache = {
    connect: async () => undefined,
    disconnect: async () => undefined,
    get: async () => null,
    set: async () => undefined,
    delete: async () => undefined,
    exists: async () => false,
    ping: async () => undefined,
  };

  return cache as unknown as RedisCacheService;
}

export function createMockOpenSearchClientService(): OpenSearchClientService {
  const client = {
    close: async () => undefined,
    health: async () => ({ status: 'green' as const }),
    indexExists: async () => true,
    createIndex: async () => undefined,
    deleteIndex: async () => undefined,
    indexDocument: async () => undefined,
    updateDocument: async () => undefined,
    deleteDocument: async () => undefined,
    search: async () => ({ total: 0, hits: [] }),
    ping: async () => undefined,
  };

  return client as unknown as OpenSearchClientService;
}

export function createMockMinioStorageService(): MinioStorageService {
  const storage = {
    initialize: async () => undefined,
    upload: async (input: { key: string; bucket?: string }) => ({
      key: input.key,
      bucket: input.bucket ?? 'novacommerce-test',
    }),
    download: async () => new Uint8Array(),
    delete: async () => undefined,
    exists: async () => false,
    ping: async () => undefined,
  };

  return storage as unknown as MinioStorageService;
}

export function createMockHealthProbeService(
  checks: Partial<Record<'database' | 'redis' | 'opensearch' | 'minio', 'up' | 'down'>> = {},
): HealthProbeService {
  return new HealthProbeService({
    database: async () => {
      if (checks.database === 'down') {
        throw new Error('database down');
      }
    },
    redis: async () => {
      if (checks.redis === 'down') {
        throw new Error('redis down');
      }
    },
    opensearch: async () => {
      if (checks.opensearch === 'down') {
        throw new Error('opensearch down');
      }
    },
    minio: async () => {
      if (checks.minio === 'down') {
        throw new Error('minio down');
      }
    },
  });
}
