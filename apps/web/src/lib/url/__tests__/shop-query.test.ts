import { describe, expect, it } from 'vitest';
import { parseShopQuery, shopHref } from '../shop-query';

describe('parseShopQuery', () => {
  it('reads shareable shop filters from the URL', () => {
    expect(
      parseShopQuery({
        q: 'laptop',
        sort: 'price-asc',
        sale: 'true',
        page: '2',
        category: 'electronics',
        brand: ['Apple', 'Sony'],
        minPrice: '100',
        maxPrice: '900',
        rating: '4',
        availability: 'in-stock',
      }),
    ).toEqual({
      q: 'laptop',
      categories: ['electronics'],
      brands: ['Apple', 'Sony'],
      minPrice: 100,
      maxPrice: 900,
      rating: 4,
      inStock: true,
      sort: 'price-asc',
      sale: true,
      page: 2,
    });
  });

  it('ignores invalid sort and page values', () => {
    expect(parseShopQuery({ sort: 'drop-table', page: '-1' })).toEqual({
      q: undefined,
      categories: [],
      brands: [],
      minPrice: undefined,
      maxPrice: undefined,
      rating: undefined,
      inStock: false,
      sort: 'featured',
      sale: false,
      page: 1,
    });
  });

  it('accepts repeated category values', () => {
    expect(parseShopQuery({ category: ['smartphones', 'laptops'] }).categories).toEqual([
      'smartphones',
      'laptops',
    ]);
  });
});

describe('shopHref', () => {
  it('omits default featured sort and page 1', () => {
    expect(
      shopHref({
        categories: ['smartphones'],
        brands: [],
        inStock: false,
        sort: 'featured',
        sale: false,
        page: 1,
      }),
    ).toBe('/shop?category=smartphones');
  });
});
