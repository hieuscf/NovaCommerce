import { describe, expect, it } from 'vitest';
import {
  accountsHref,
  hasRemovedAccountsRoleParam,
  parseAccountsQuery,
} from '../accounts-query';

describe('parseAccountsQuery', () => {
  it('parses defaults', () => {
    expect(parseAccountsQuery({})).toEqual({
      q: undefined,
      status: 'all',
      page: 1,
    });
  });

  it('parses filters and page and ignores removed role views', () => {
    expect(
      parseAccountsQuery({ q: ' sarah ', role: 'admin', status: 'blocked', page: '3' }),
    ).toEqual({
      q: 'sarah',
      status: 'blocked',
      page: 3,
    });
  });
});

describe('accountsHref', () => {
  it('omits default filters', () => {
    expect(accountsHref({ status: 'all', page: 1 })).toBe('/accounts');
  });

  it('serializes active filters without role', () => {
    expect(accountsHref({ q: 'sarah', status: 'active', page: 2 })).toBe(
      '/accounts?q=sarah&status=active&page=2',
    );
  });
});

describe('hasRemovedAccountsRoleParam', () => {
  it('detects legacy role query views', () => {
    expect(hasRemovedAccountsRoleParam({ role: 'customer' })).toBe(true);
    expect(hasRemovedAccountsRoleParam({ role: 'admin' })).toBe(true);
    expect(hasRemovedAccountsRoleParam({ status: 'blocked' })).toBe(false);
  });
});
