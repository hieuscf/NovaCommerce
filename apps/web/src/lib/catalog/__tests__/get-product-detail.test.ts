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
    expect(detail?.seller.name).toBe('NovaStore');
    expect(detail?.highlightSpecs.length).toBeGreaterThan(0);
    expect(detail?.trustItems).toHaveLength(4);
  });

  it('uses MacBook extras for the Alloy product detail fixture', () => {
    const detail = getProductDetailBySlug('macbook-air-m2');

    expect(detail?.descriptionTitle).toBe('Power meets portability');
    expect(detail?.highlightSpecs.map((item) => item.label)).toEqual([
      'M2 Chip',
      '8GB RAM',
      '13.6" Display',
    ]);
    expect(detail?.variants[0]?.type).toBe('image');
    expect(detail?.related.map((item) => item.slug)).toEqual([
      'dell-xps-15',
      'airpods-pro-2',
      'apple-watch-series-10',
      'nike-air-force-1',
    ]);
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
