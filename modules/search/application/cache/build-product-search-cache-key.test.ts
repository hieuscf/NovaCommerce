import { describe, expect, it } from 'vitest';
import type { ProductSearchCriteria } from '../../domain/queries/product-search-criteria';
import { buildProductSearchCacheKey } from './build-product-search-cache-key';

function criteria(overrides: Partial<ProductSearchCriteria> = {}): ProductSearchCriteria {
  return {
    sort: 'createdAt_desc',
    page: 1,
    pageSize: 20,
    ...overrides,
  };
}

describe('buildProductSearchCacheKey', () => {
  it('is deterministic for equivalent queries regardless of object key order', () => {
    const left = buildProductSearchCacheKey(
      criteria({
        query: 'Phone',
        page: 1,
        pageSize: 20,
      }),
    );
    const right = buildProductSearchCacheKey({
      pageSize: 20,
      query: 'phone',
      page: 1,
      sort: 'createdAt_desc',
    });

    expect(left).toBe(right);
    expect(left).toMatch(/^search:products:[a-f0-9]{64}$/);
  });

  it('changes when a filter or sort changes', () => {
    const base = buildProductSearchCacheKey(criteria({ query: 'phone' }));
    const filtered = buildProductSearchCacheKey(criteria({ query: 'phone', status: 'published' }));
    const sorted = buildProductSearchCacheKey(criteria({ query: 'phone', sort: 'price_asc' }));

    expect(filtered).not.toBe(base);
    expect(sorted).not.toBe(base);
  });
});
