import { describe, expect, it } from 'vitest';
import { parseProductsQuery, productsHref } from '../products-query';

describe('parseProductsQuery', () => {
  it('parses defaults', () => {
    expect(parseProductsQuery({})).toEqual({
      q: undefined,
      category: 'all',
      brand: 'all',
      status: 'all',
      page: 1,
    });
  });

  it('parses filters and page', () => {
    expect(
      parseProductsQuery({
        q: ' airpods ',
        category: 'Electronics',
        brand: 'Apple',
        status: 'active',
        page: '3',
      }),
    ).toEqual({
      q: 'airpods',
      category: 'Electronics',
      brand: 'Apple',
      status: 'active',
      page: 3,
    });
  });
});

describe('productsHref', () => {
  it('omits default filters', () => {
    expect(productsHref({ category: 'all', brand: 'all', status: 'all', page: 1 })).toBe(
      '/products',
    );
  });

  it('serializes active filters', () => {
    expect(
      productsHref({
        q: 'airpods',
        category: 'Electronics',
        brand: 'Apple',
        status: 'active',
        page: 2,
      }),
    ).toBe('/products?q=airpods&category=Electronics&brand=Apple&status=active&page=2');
  });
});
