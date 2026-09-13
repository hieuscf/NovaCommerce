import { describe, expect, it } from 'vitest';
import { parseShopQuery } from '../shop-query';

describe('parseShopQuery', () => {
  it('reads shareable shop filters from the URL', () => {
    expect(
      parseShopQuery({
        q: 'laptop',
        sort: 'price-asc',
        sale: 'true',
        page: '2',
      }),
    ).toEqual({
      q: 'laptop',
      category: undefined,
      sort: 'price-asc',
      sale: true,
      page: 2,
    });
  });

  it('ignores invalid sort and page values', () => {
    expect(parseShopQuery({ sort: 'drop-table', page: '-1' })).toEqual({
      q: undefined,
      category: undefined,
      sort: undefined,
      sale: false,
      page: 1,
    });
  });
});
