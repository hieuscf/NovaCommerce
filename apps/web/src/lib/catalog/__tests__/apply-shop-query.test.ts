import { describe, expect, it } from 'vitest';
import { applyShopQuery } from '../apply-shop-query';
import { catalogProducts } from '@/lib/mock-data/catalog';
import { parseShopQuery } from '@/lib/url/shop-query';

const emptyQuery = parseShopQuery({});

describe('applyShopQuery', () => {
  it('pages the catalog without dropping unmatched products', () => {
    const result = applyShopQuery(catalogProducts, emptyQuery);
    expect(result.total).toBe(catalogProducts.length);
    expect(result.items).toHaveLength(12);
    expect(result.totalPages).toBeGreaterThan(1);
  });

  it('keeps electronics collections and leaf categories aligned', () => {
    const electronics = applyShopQuery(
      catalogProducts,
      parseShopQuery({ category: 'electronics' }),
    );
    const phones = applyShopQuery(
      catalogProducts,
      parseShopQuery({ category: 'smartphones' }),
    );

    expect(electronics.total).toBeGreaterThan(phones.total);
    expect(phones.items.every((product) => product.categorySlug === 'smartphones')).toBe(true);
  });

  it('narrows a collection path with an extra category filter', () => {
    const electronics = applyShopQuery(
      catalogProducts,
      parseShopQuery({}, { collection: 'electronics' }),
    );
    const laptops = applyShopQuery(
      catalogProducts,
      parseShopQuery({ category: 'laptops' }, { collection: 'electronics' }),
    );

    expect(laptops.total).toBeGreaterThan(0);
    expect(laptops.total).toBeLessThan(electronics.total);
    expect(laptops.items.every((product) => product.categorySlug === 'laptops')).toBe(true);
  });

  it('sorts by price ascending', () => {
    const result = applyShopQuery(catalogProducts, parseShopQuery({ sort: 'price-asc' }));
    const prices = result.items.map((product) => product.price);
    expect(prices).toEqual([...prices].sort((left, right) => left - right));
  });

  it('returns no items when filters match nothing', () => {
    const result = applyShopQuery(
      catalogProducts,
      parseShopQuery({ category: 'smartphones', brand: 'Nike' }),
    );
    expect(result.total).toBe(0);
    expect(result.items).toHaveLength(0);
    expect(result.totalPages).toBe(0);
  });
});
