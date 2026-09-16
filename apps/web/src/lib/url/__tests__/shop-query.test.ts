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
        view: 'list',
      }),
    ).toEqual({
      q: 'laptop',
      collection: undefined,
      categories: ['electronics'],
      brands: ['Apple', 'Sony'],
      minPrice: 100,
      maxPrice: 900,
      rating: 4,
      inStock: true,
      sort: 'price-asc',
      sale: true,
      view: 'list',
      page: 2,
    });
  });

  it('reads a collection from the path separately from facet categories', () => {
    expect(parseShopQuery({ category: 'laptops' }, { collection: 'electronics' })).toMatchObject({
      collection: 'electronics',
      categories: ['laptops'],
    });
  });

  it('ignores invalid sort and page values', () => {
    expect(parseShopQuery({ sort: 'drop-table', page: '-1' })).toEqual({
      q: undefined,
      collection: undefined,
      categories: [],
      brands: [],
      minPrice: undefined,
      maxPrice: undefined,
      rating: undefined,
      inStock: false,
      sort: 'featured',
      sale: false,
      view: 'grid',
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
  it('canonicalizes a single category onto /shop/[category]', () => {
    expect(
      shopHref({
        categories: ['smartphones'],
        brands: [],
        inStock: false,
        sort: 'featured',
        sale: false,
        view: 'grid',
        page: 1,
      }),
    ).toBe('/shop/smartphones');
  });

  it('keeps extra category filters on a collection path', () => {
    expect(
      shopHref({
        collection: 'electronics',
        categories: ['laptops'],
        brands: ['Apple'],
        inStock: false,
        sort: 'featured',
        sale: false,
        view: 'grid',
        page: 1,
      }),
    ).toBe('/shop/electronics?category=laptops&brand=Apple');
  });
});
