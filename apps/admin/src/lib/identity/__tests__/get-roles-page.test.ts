import { describe, expect, it } from 'vitest';
import {
  applyPermissionCellToggle,
  buildRolesPageViewModel,
  formatRoleDisplayName,
  formatRoleTimestamp,
  mapActionToColumn,
} from '../get-roles-page';

describe('formatRoleDisplayName', () => {
  it('title-cases role names', () => {
    expect(formatRoleDisplayName('admin')).toBe('Admin');
    expect(formatRoleDisplayName('super_admin')).toBe('Super Admin');
  });
});

describe('formatRoleTimestamp', () => {
  it('formats ISO timestamps', () => {
    expect(formatRoleTimestamp('2025-09-18T12:00:00.000Z')).toMatch(/2025/);
  });

  it('returns em dash for missing values', () => {
    expect(formatRoleTimestamp(null)).toBe('—');
    expect(formatRoleTimestamp(undefined)).toBe('—');
  });
});

describe('mapActionToColumn', () => {
  it('maps common actions', () => {
    expect(mapActionToColumn('read')).toBe('view');
    expect(mapActionToColumn('role:create')).toBe('create');
    expect(mapActionToColumn('role:assign')).toBe('manage');
    expect(mapActionToColumn('role:revoke')).toBe('delete');
  });
});

describe('buildRolesPageViewModel', () => {
  it('builds selected role permission matrix', () => {
    const view = buildRolesPageViewModel(
      [
        {
          id: 'r1',
          name: 'admin',
          description: 'Platform administrator',
          permissions: ['identity:role:create', 'identity:role:assign', 'admin:read'],
        },
        {
          id: 'r2',
          name: 'support',
          description: 'Customer support',
          permissions: ['admin:read'],
        },
      ],
      [
        { id: 'p1', key: 'identity:role:create' },
        { id: 'p2', key: 'identity:role:assign' },
        { id: 'p3', key: 'admin:read' },
      ],
      {
        type: 'all',
        tab: 'permissions',
        grant: 'all',
        roleId: 'r1',
        page: 1,
      },
    );

    expect(view.selectedRole?.id).toBe('r1');
    expect(view.detail?.grantedCount).toBe(3);
    expect(view.detail?.totalCount).toBe(3);
    expect(view.detail?.modules.length).toBeGreaterThan(0);
    expect(view.detail?.modules.some((module) => module.id === 'identity')).toBe(true);

    const roleFeature = view.detail?.modules
      .flatMap((module) => module.features)
      .find((feature) => feature.id === 'identity:role');
    expect(roleFeature?.cells).toHaveLength(5);
    expect(roleFeature?.cells.find((cell) => cell.column === 'create')?.granted).toBe(true);
    expect(roleFeature?.cells.find((cell) => cell.column === 'create')?.interactive).toBe(true);
    expect(roleFeature?.cells.find((cell) => cell.column === 'manage')?.granted).toBe(true);
    expect(roleFeature?.cells.find((cell) => cell.column === 'manage')?.interactive).toBe(true);
    expect(roleFeature?.cells.find((cell) => cell.column === 'view')?.interactive).toBe(false);
  });

  it('sorts Super Admin before Admin', () => {
    const view = buildRolesPageViewModel(
      [
        {
          id: 'r-admin',
          name: 'admin',
          description: 'Platform administrator',
          permissions: ['admin:read'],
        },
        {
          id: 'r-super',
          name: 'super_admin',
          description: 'Full access',
          permissions: ['admin:read', 'identity:role:create'],
        },
      ],
      [{ id: 'p1', key: 'admin:read' }],
      {
        type: 'all',
        tab: 'permissions',
        grant: 'all',
        page: 1,
      },
    );

    expect(view.filteredRoles.map((role) => role.name)).toEqual(['super_admin', 'admin']);
    expect(view.selectedRole?.id).toBe('r-super');
  });

  it('filters matrix by grant state', () => {
    const view = buildRolesPageViewModel(
      [
        {
          id: 'r1',
          name: 'admin',
          description: 'Platform administrator',
          permissions: ['admin:read'],
        },
      ],
      [
        { id: 'p1', key: 'admin:read' },
        { id: 'p2', key: 'identity:role:create' },
      ],
      {
        type: 'all',
        tab: 'permissions',
        grant: 'not_granted',
        roleId: 'r1',
        page: 1,
      },
    );

    const keys = view.detail?.modules.flatMap((module) => module.features.map((f) => f.id));
    expect(keys).toEqual(['identity:role']);
  });
});

describe('applyPermissionCellToggle', () => {
  it('grants and revokes the keys in a cell', () => {
    const granted = applyPermissionCellToggle([], {
      column: 'create',
      keys: ['catalog:product:create'],
      key: 'catalog:product:create',
      granted: false,
      interactive: true,
      busyKey: 'catalog:product:create',
    });
    expect(granted).toEqual(['catalog:product:create']);

    const revoked = applyPermissionCellToggle(granted, {
      column: 'create',
      keys: ['catalog:product:create'],
      key: 'catalog:product:create',
      granted: true,
      interactive: true,
      busyKey: 'catalog:product:create',
    });
    expect(revoked).toEqual([]);
  });
});
