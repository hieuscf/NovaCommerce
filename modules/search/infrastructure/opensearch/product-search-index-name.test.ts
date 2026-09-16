import { describe, expect, it } from 'vitest';
import { PRODUCT_SEARCH_INDEX, resolveProductSearchIndexName } from './product-search-index-name';

describe('resolveProductSearchIndexName', () => {
  it('returns the centralized product search index name by default', () => {
    expect(resolveProductSearchIndexName()).toBe(PRODUCT_SEARCH_INDEX);
    expect(PRODUCT_SEARCH_INDEX).toBe('novacommerce-products');
  });

  it('uses an explicit override when provided', () => {
    expect(resolveProductSearchIndexName('products-v2')).toBe('products-v2');
  });

  it('ignores blank overrides', () => {
    expect(resolveProductSearchIndexName('   ')).toBe(PRODUCT_SEARCH_INDEX);
    expect(resolveProductSearchIndexName(undefined)).toBe(PRODUCT_SEARCH_INDEX);
  });
});
