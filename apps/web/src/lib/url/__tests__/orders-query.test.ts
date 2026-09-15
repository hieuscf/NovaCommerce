import { describe, expect, it } from 'vitest';
import { parseOrdersQuery, ordersHref } from '../orders-query';

describe('parseOrdersQuery', () => {
  it('defaults to all orders on page 1', () => {
    expect(parseOrdersQuery({})).toEqual({ status: 'all', page: 1 });
  });

  it('reads a known status and page from the URL', () => {
    expect(parseOrdersQuery({ status: 'shipped', page: '2' })).toEqual({
      status: 'shipped',
      page: 2,
    });
  });

  it('falls back for unknown or empty values', () => {
    expect(parseOrdersQuery({ status: 'drop-table', page: '0' })).toEqual({
      status: 'all',
      page: 1,
    });
    expect(parseOrdersQuery({ status: ['delivered', 'cancelled'] })).toEqual({
      status: 'delivered',
      page: 1,
    });
  });
});

describe('ordersHref', () => {
  it('omits default all/page-1 params', () => {
    expect(ordersHref({ status: 'all', page: 1 })).toBe('/orders');
  });

  it('keeps shareable filter and page state in the URL', () => {
    expect(ordersHref({ status: 'processing', page: 2 })).toBe('/orders?status=processing&page=2');
  });
});
