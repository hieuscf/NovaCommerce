import { describe, expect, it } from 'vitest';
import type { ProductSearchCriteria } from '../../domain/queries/product-search-criteria';
import { buildProductSearchRequest } from './build-product-search-query';

function criteria(overrides: Partial<ProductSearchCriteria> = {}): ProductSearchCriteria {
  return {
    sort: 'createdAt_desc',
    page: 1,
    pageSize: 20,
    ...overrides,
  };
}

describe('buildProductSearchRequest', () => {
  it('uses match_all when no keyword or filters are provided', () => {
    const request = buildProductSearchRequest(criteria());

    expect(request.query).toEqual({ match_all: {} });
    expect(request.from).toBe(0);
    expect(request.size).toBe(20);
  });

  it('builds a keyword query with exact and range filters', () => {
    const request = buildProductSearchRequest(
      criteria({
        query: 'phone',
        categoryId: 'cat-1',
        brandId: 'brand-1',
        status: 'published',
        minPrice: 10,
        maxPrice: 200,
        sort: 'price_asc',
      }),
    );

    expect(request.query).toEqual({
      bool: {
        must: [
          {
            bool: {
              should: [
                {
                  multi_match: {
                    query: 'phone',
                    fields: ['name^3', 'description', 'brand.name', 'tags'],
                  },
                },
                {
                  nested: {
                    path: 'categories',
                    query: { match: { 'categories.name': 'phone' } },
                  },
                },
              ],
              minimum_should_match: 1,
            },
          },
        ],
        filter: [
          { term: { status: 'published' } },
          { term: { 'brand.id': 'brand-1' } },
          {
            nested: {
              path: 'categories',
              query: { term: { 'categories.id': 'cat-1' } },
            },
          },
          { range: { price: { gte: 10, lte: 200 } } },
        ],
      },
    });
  });

  it('maps sort options to OpenSearch sort with a stable id tie-breaker', () => {
    expect(buildProductSearchRequest(criteria({ sort: 'relevance' })).sort).toEqual([
      { _score: { order: 'desc' } },
      { id: { order: 'asc' } },
    ]);
    expect(buildProductSearchRequest(criteria({ sort: 'price_asc' })).sort).toEqual([
      { price: { order: 'asc' } },
      { id: { order: 'asc' } },
    ]);
    expect(buildProductSearchRequest(criteria({ sort: 'price_desc' })).sort).toEqual([
      { price: { order: 'desc' } },
      { id: { order: 'asc' } },
    ]);
    expect(buildProductSearchRequest(criteria({ sort: 'name_asc' })).sort).toEqual([
      { 'name.keyword': { order: 'asc' } },
      { id: { order: 'asc' } },
    ]);
    expect(buildProductSearchRequest(criteria({ sort: 'name_desc' })).sort).toEqual([
      { 'name.keyword': { order: 'desc' } },
      { id: { order: 'asc' } },
    ]);
    expect(buildProductSearchRequest(criteria({ sort: 'createdAt_desc' })).sort).toEqual([
      { createdAt: { order: 'desc' } },
      { id: { order: 'asc' } },
    ]);
  });

  it('maps page and pageSize to from and size', () => {
    expect(buildProductSearchRequest(criteria({ page: 1, pageSize: 20 })).from).toBe(0);
    expect(buildProductSearchRequest(criteria({ page: 2, pageSize: 20 })).from).toBe(20);
    expect(buildProductSearchRequest(criteria({ page: 2, pageSize: 20 })).size).toBe(20);
  });
});
