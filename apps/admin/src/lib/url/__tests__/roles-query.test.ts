import { describe, expect, it } from 'vitest';
import { parseRolesQuery, rolesHref } from '../roles-query';

describe('parseRolesQuery', () => {
  it('parses defaults', () => {
    expect(parseRolesQuery({})).toEqual({
      q: undefined,
      type: 'all',
      roleId: undefined,
      tab: 'permissions',
      grant: 'all',
      pq: undefined,
      page: 1,
    });
  });

  it('parses detail filters', () => {
    expect(
      parseRolesQuery({
        role: 'r1',
        tab: 'users',
        grant: 'granted',
        pq: 'identity',
        page: '2',
      }),
    ).toEqual({
      q: undefined,
      type: 'all',
      roleId: 'r1',
      tab: 'users',
      grant: 'granted',
      pq: 'identity',
      page: 2,
    });
  });
});

describe('rolesHref', () => {
  it('omits default filters', () => {
    expect(rolesHref({ type: 'all', tab: 'permissions', grant: 'all', page: 1 })).toBe(
      '/accounts/roles',
    );
  });

  it('serializes detail state', () => {
    expect(
      rolesHref({
        roleId: 'r1',
        tab: 'users',
        grant: 'not_granted',
        pq: 'admin',
      }),
    ).toBe('/accounts/roles?role=r1&tab=users&grant=not_granted&pq=admin');
  });
});
