import { describe, expect, it } from 'vitest';
import { MAX_PRODUCT_SEARCH_PAGE_SIZE } from '../constants';
import { normalizeSearchProductsQuery } from './normalize-search-products-query';

describe('normalizeSearchProductsQuery', () => {
  it('defaults browse queries to createdAt_desc and first page', () => {
    const result = normalizeSearchProductsQuery({});

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual({
      query: undefined,
      categoryId: undefined,
      brandId: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      status: undefined,
      sort: 'createdAt_desc',
      page: 1,
      pageSize: 20,
    });
  });

  it('defaults keyword queries to relevance sort', () => {
    const result = normalizeSearchProductsQuery({ query: '  Phone  ' });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().query).toBe('Phone');
    expect(result.getValue().sort).toBe('relevance');
  });

  it('keeps an explicit sort when a keyword is present', () => {
    const result = normalizeSearchProductsQuery({ query: 'phone', sort: 'price_asc' });

    expect(result.getValue().sort).toBe('price_asc');
  });

  it('accepts combined exact and range filters', () => {
    const result = normalizeSearchProductsQuery({
      categoryId: '44444444-4444-4444-4444-444444444444',
      brandId: '33333333-3333-3333-3333-333333333333',
      status: 'published',
      minPrice: 10,
      maxPrice: 200,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toMatchObject({
      categoryId: '44444444-4444-4444-4444-444444444444',
      brandId: '33333333-3333-3333-3333-333333333333',
      status: 'published',
      minPrice: 10,
      maxPrice: 200,
    });
  });

  it('rejects negative prices', () => {
    expect(normalizeSearchProductsQuery({ minPrice: -1 }).getError().code).toBe('INVALID_SEARCH_MIN_PRICE');
    expect(normalizeSearchProductsQuery({ maxPrice: -5 }).getError().code).toBe('INVALID_SEARCH_MAX_PRICE');
  });

  it('rejects minPrice greater than maxPrice', () => {
    const result = normalizeSearchProductsQuery({ minPrice: 50, maxPrice: 10 });

    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('INVALID_SEARCH_PRICE_RANGE');
  });

  it('rejects unsupported status and sort values', () => {
    expect(normalizeSearchProductsQuery({ status: 'hidden' }).getError().code).toBe('INVALID_SEARCH_STATUS');
    expect(normalizeSearchProductsQuery({ sort: 'popularity' }).getError().code).toBe('INVALID_SEARCH_SORT');
  });

  it('rejects invalid pagination', () => {
    expect(normalizeSearchProductsQuery({ page: 0 }).getError().code).toBe('INVALID_SEARCH_PAGE');
    expect(normalizeSearchProductsQuery({ page: -1 }).getError().code).toBe('INVALID_SEARCH_PAGE');
    expect(normalizeSearchProductsQuery({ pageSize: 0 }).getError().code).toBe('INVALID_SEARCH_PAGE_SIZE');
    expect(normalizeSearchProductsQuery({ pageSize: MAX_PRODUCT_SEARCH_PAGE_SIZE + 1 }).getError().code).toBe(
      'INVALID_SEARCH_PAGE_SIZE',
    );
  });
});
