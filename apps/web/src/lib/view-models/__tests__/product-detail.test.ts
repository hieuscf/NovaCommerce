import { describe, expect, it } from 'vitest';
import {
  defaultVariantSelection,
  getProductBreadcrumbs,
  ratingBarPercent,
} from '../product-detail';
import { catalogProducts } from '@/lib/mock-data/catalog';
import { productDetailExtras } from '@/lib/mock-data/product-detail';

describe('getProductBreadcrumbs', () => {
  it('builds Home / department / category / product crumbs', () => {
    const product = catalogProducts.find((item) => item.slug === 'iphone-17-pro');
    expect(product).toBeDefined();
    expect(getProductBreadcrumbs(product!)).toEqual([
      { href: '/', label: 'Home' },
      { href: '/shop?category=electronics', label: 'Electronics' },
      { href: '/shop?category=smartphones', label: 'Smartphones' },
      { href: '/products/iphone-17-pro', label: 'iPhone 17 Pro', current: true },
    ]);
  });
});

describe('defaultVariantSelection', () => {
  it('prefers options mentioned in the listing variant hint', () => {
    const variants = productDetailExtras['iphone-17-pro']?.variants ?? [];
    const selected = defaultVariantSelection(variants, '256GB · Natural Titanium');

    expect(selected).toMatchObject({
      color: 'natural',
      storage: '256',
    });
  });
});

describe('ratingBarPercent', () => {
  it('returns 0 when there are no reviews', () => {
    expect(ratingBarPercent(12, 0)).toBe(0);
  });

  it('rounds the share of a star bucket', () => {
    expect(ratingBarPercent(98, 124)).toBe(79);
  });
});
