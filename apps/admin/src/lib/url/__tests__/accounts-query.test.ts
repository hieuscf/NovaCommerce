import { describe, expect, it } from 'vitest';
import { accountsHref, parseAccountsQuery } from '../accounts-query';

describe('parseAccountsQuery', () => {
  it('parses defaults', () => {
    expect(parseAccountsQuery({})).toEqual({
      q: undefined,
      role: 'all',
      status: 'all',
      page: 1,
    });
  });

  it('parses filters and page', () => {
    expect(
      parseAccountsQuery({ q: ' sarah ', role: 'admin', status: 'blocked', page: '3' }),
    ).toEqual({
      q: 'sarah',
      role: 'admin',
      status: 'blocked',
      page: 3,
    });
  });
});

describe('accountsHref', () => {
  it('omits default filters', () => {
    expect(accountsHref({ role: 'all', status: 'all', page: 1 })).toBe('/accounts');
  });

  it('serializes active filters', () => {
    expect(accountsHref({ q: 'sarah', role: 'customer', status: 'active', page: 2 })).toBe(
      '/accounts?q=sarah&role=customer&status=active&page=2',
    );
  });
});
