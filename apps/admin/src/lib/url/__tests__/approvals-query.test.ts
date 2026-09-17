import { describe, expect, it } from 'vitest';
import { approvalsHref, parseApprovalsQuery } from '../approvals-query';

describe('parseApprovalsQuery', () => {
  it('defaults status to pending', () => {
    expect(parseApprovalsQuery({})).toEqual({
      q: undefined,
      status: 'pending',
      category: 'all',
      sort: 'newest',
      page: 1,
      id: undefined,
    });
  });

  it('parses drawer id and filters', () => {
    expect(
      parseApprovalsQuery({
        q: 'tech',
        status: 'approved',
        category: 'electronics',
        sort: 'oldest',
        page: '2',
        id: 'app_001',
      }),
    ).toEqual({
      q: 'tech',
      status: 'approved',
      category: 'electronics',
      sort: 'oldest',
      page: 2,
      id: 'app_001',
    });
  });
});

describe('approvalsHref', () => {
  it('omits default pending filters', () => {
    expect(
      approvalsHref({ status: 'pending', category: 'all', sort: 'newest', page: 1 }),
    ).toBe('/sellers/approvals');
  });

  it('serializes id for the detail drawer', () => {
    expect(approvalsHref({ status: 'pending', id: 'app_001' })).toBe(
      '/sellers/approvals?id=app_001',
    );
  });
});
