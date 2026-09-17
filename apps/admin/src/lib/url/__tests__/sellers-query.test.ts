import { describe, expect, it } from 'vitest';
import { parseSellersQuery, sellersHref } from '../sellers-query';

describe('parseSellersQuery', () => {
  it('parses defaults', () => {
    expect(parseSellersQuery({})).toEqual({
      q: undefined,
      status: 'all',
      verified: 'all',
      sort: 'newest',
      page: 1,
    });
  });

  it('parses filters and page', () => {
    expect(
      parseSellersQuery({
        q: ' tech ',
        status: 'pending',
        verified: 'verified',
        sort: 'sales_desc',
        page: '2',
      }),
    ).toEqual({
      q: 'tech',
      status: 'pending',
      verified: 'verified',
      sort: 'sales_desc',
      page: 2,
    });
  });
});

describe('sellersHref', () => {
  it('omits default filters', () => {
    expect(
      sellersHref({ status: 'all', verified: 'all', sort: 'newest', page: 1 }),
    ).toBe('/sellers');
  });

  it('serializes active filters', () => {
    expect(
      sellersHref({
        q: 'tech',
        status: 'suspended',
        verified: 'unverified',
        sort: 'orders_desc',
        page: 3,
      }),
    ).toBe('/sellers?q=tech&status=suspended&verified=unverified&sort=orders_desc&page=3');
  });
});
