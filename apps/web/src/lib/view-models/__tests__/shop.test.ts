import { describe, expect, it } from 'vitest';
import { formatProductCount, formatResultRange, getShopHeader } from '../shop';
import { parseShopQuery } from '@/lib/url/shop-query';

describe('getShopHeader', () => {
  it('uses Shop as the root listing title', () => {
    expect(getShopHeader(parseShopQuery({}))).toMatchObject({
      title: 'Shop',
    });
  });

  it('names a collection from the path and links parent crumbs to /shop/[category]', () => {
    const header = getShopHeader(parseShopQuery({}, { collection: 'smartphones' }));
    expect(header.title).toBe('Smartphones');
    expect(header.crumbs).toEqual([
      { href: '/', label: 'Home' },
      { href: '/shop', label: 'Shop' },
      { href: '/shop/electronics', label: 'Electronics' },
      { href: '/shop/smartphones', label: 'Smartphones', current: true },
    ]);
  });
});

describe('formatProductCount', () => {
  it('formats the catalog size shown in the listing toolbar', () => {
    expect(formatProductCount(1)).toBe('1 product');
    expect(formatProductCount(7)).toBe('7 products');
    expect(formatProductCount(1248)).toBe('1,248 products');
  });
});

describe('formatResultRange', () => {
  it('summarizes a full single page', () => {
    expect(formatResultRange({ total: 7, page: 1, pageSize: 12 })).toBe('7 results');
  });

  it('shows the window on a paginated list', () => {
    expect(formatResultRange({ total: 26, page: 1, pageSize: 12 })).toBe('1–12 of 26');
    expect(formatResultRange({ total: 26, page: 3, pageSize: 12 })).toBe('25–26 of 26');
  });
});
