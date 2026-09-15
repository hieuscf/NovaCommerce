import { describe, expect, it } from 'vitest';
import { getProductDetailBySlug, listProductSlugs } from '../get-product-detail';
import { catalogProducts } from '@/lib/mock-data/catalog';

describe('getProductDetailBySlug', () => {
  it('returns a full presentation model for a catalog slug', () => {
    const detail = getProductDetailBySlug('iphone-17-pro');

    expect(detail?.product.name).toBe('iPhone 17 Pro');
    expect(detail?.availability).toBe('in_stock');
    expect(detail?.images.length).toBeGreaterThan(1);
    expect(detail?.variants).toHaveLength(2);
    expect(detail?.related.every((item) => item.slug !== 'iphone-17-pro')).toBe(true);
    expect(detail?.crumbs.at(-1)).toMatchObject({ label: 'iPhone 17 Pro', current: true });
  });

  it('marks listing out-of-stock products as unavailable without dropping details', () => {
    const detail = getProductDetailBySlug('galaxy-book4-pro');

    expect(detail?.availability).toBe('out_of_stock');
    expect(detail?.shortDescription).toBeTruthy();
    expect(detail?.specifications.length).toBeGreaterThan(0);
  });

  it('returns undefined for an unknown slug', () => {
    expect(getProductDetailBySlug('not-a-product')).toBeUndefined();
  });

  it('covers every listing slug', () => {
    expect(listProductSlugs()).toHaveLength(catalogProducts.length);
    expect(catalogProducts.every((product) => getProductDetailBySlug(product.slug))).toBe(true);
  });
});
