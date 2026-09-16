import { describe, expect, it, vi } from 'vitest';
import { InfrastructureError } from '@novacommerce/building-blocks';
import type { IProductSearchIndex } from '../../domain/repositories/i-product-search-index';
import { EnsureProductSearchIndexHandler } from './ensure-product-search-index.handler';

describe('EnsureProductSearchIndexHandler', () => {
  it('ensures the product search index through the domain port', async () => {
    const productSearchIndex: IProductSearchIndex = {
      ensureIndex: vi.fn().mockResolvedValue(undefined),
      indexDocument: vi.fn(),
      updateDocument: vi.fn(),
      deleteDocument: vi.fn(),
    };

    const handler = new EnsureProductSearchIndexHandler(productSearchIndex);
    const result = await handler.execute();

    expect(result.isSuccess).toBe(true);
    expect(productSearchIndex.ensureIndex).toHaveBeenCalledTimes(1);
  });

  it('translates infrastructure failures without exposing raw OpenSearch errors', async () => {
    const productSearchIndex: IProductSearchIndex = {
      ensureIndex: vi.fn().mockRejectedValue(new InfrastructureError('OpenSearch create index failed', 'SEARCH_ERROR')),
      indexDocument: vi.fn(),
      updateDocument: vi.fn(),
      deleteDocument: vi.fn(),
    };

    const handler = new EnsureProductSearchIndexHandler(productSearchIndex);
    const result = await handler.execute();

    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('SEARCH_ERROR');
    expect(result.getError().message).toBe('OpenSearch create index failed');
  });
});
