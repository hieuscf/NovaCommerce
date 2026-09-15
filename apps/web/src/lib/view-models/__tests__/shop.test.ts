import { describe, expect, it } from 'vitest';
import { formatResultRange, getShopHeader } from '../shop';
import { parseShopQuery } from '@/lib/url/shop-query';

describe('getShopHeader', () => {
  it('uses a catalog title instead of marketing copy on the root listing', () => {
    expect(getShopHeader(parseShopQuery({}))).toMatchObject({
      title: 'All products',
    });
  });

  it('names a single selected collection', () => {
    expect(getShopHeader(parseShopQuery({ category: 'smartphones' })).title).toBe('Smartphones');
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
