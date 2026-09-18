import { describe, expect, it } from 'vitest';
import { ordersHref, parseOrdersQuery } from '../orders-query';

describe('parseOrdersQuery', () => {
  it('parses defaults', () => {
    expect(parseOrdersQuery({})).toEqual({
      q: undefined,
      status: 'all',
      payment: 'all',
      range: 'last_30_days',
      page: 1,
    });
  });

  it('parses filters and page', () => {
    expect(
      parseOrdersQuery({
        q: ' emma ',
        status: 'processing',
        payment: 'paid',
        range: 'last_7_days',
        page: '3',
      }),
    ).toEqual({
      q: 'emma',
      status: 'processing',
      payment: 'paid',
      range: 'last_7_days',
      page: 3,
    });
  });
});

describe('ordersHref', () => {
  it('omits default filters', () => {
    expect(
      ordersHref({ status: 'all', payment: 'all', range: 'last_30_days', page: 1 }),
    ).toBe('/orders');
  });

  it('serializes active filters', () => {
    expect(
      ordersHref({
        q: 'emma',
        status: 'pending',
        payment: 'paid',
        range: 'last_7_days',
        page: 2,
      }),
    ).toBe('/orders?q=emma&status=pending&payment=paid&range=last_7_days&page=2');
  });
});
