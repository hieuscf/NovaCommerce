import { describe, expect, it } from 'vitest';
import {
  buildAccountsPageViewModel,
  mapAccountStatus,
  primaryRoleName,
} from '../get-accounts-page';

describe('mapAccountStatus', () => {
  it('maps identity status onto the admin table', () => {
    expect(mapAccountStatus('ACTIVE', false)).toBe('active');
    expect(mapAccountStatus('PENDING_VERIFICATION', false)).toBe('inactive');
    expect(mapAccountStatus('ACTIVE', true)).toBe('blocked');
    expect(mapAccountStatus('LOCKED', false)).toBe('blocked');
  });
});

describe('primaryRoleName', () => {
  it('prefers admin roles then the first assigned role', () => {
    expect(primaryRoleName(['customer_support', 'admin'])).toBe('admin');
    expect(primaryRoleName(['inventory_manager'])).toBe('inventory_manager');
    expect(primaryRoleName([])).toBe('customer');
  });
});

describe('buildAccountsPageViewModel', () => {
  it('builds table rows and KPI counts from Gateway data', () => {
    const view = buildAccountsPageViewModel({
      items: [
        {
          id: 'id-1',
          email: 'customer.one@novacommerce.local',
          displayName: 'Customer One',
          status: 'ACTIVE',
          disabled: false,
          roles: [],
          lastLoginAt: null,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
      summary: { total: 8, customers: 6, admins: 2, blocked: 1 },
    });

    expect(view.rows[0]?.name).toBe('Customer One');
    expect(view.rows[0]?.roleLabel).toBe('Customer');
    expect(view.kpis[0]?.value).toBe('8');
    expect(view.kpis[2]?.value).toBe('2');
  });
});
