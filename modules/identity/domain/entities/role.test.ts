import { describe, expect, it } from 'vitest';
import { PermissionKey } from '../value-objects/permission-key';
import { Role } from './role';

describe('Role', () => {
  it('protects system roles from rename and delete', () => {
    const role = Role.create('r1', 'super_admin', 'Full access');
    expect(role.isProtected()).toBe(true);
    expect(role.rename('ops').isFailure).toBe(true);
    expect(role.assertDeletable().isFailure).toBe(true);
  });

  it('allows custom roles to be renamed and deleted', () => {
    const role = Role.create('r2', 'support', 'Help desk');
    expect(role.rename('customer_support').isSuccess).toBe(true);
    expect(role.getName()).toBe('customer_support');
    expect(role.assertDeletable().isSuccess).toBe(true);
  });

  it('assigns and removes permissions', () => {
    const role = Role.create('r3', 'analyst');
    const key = PermissionKey.create('analytics:report:view');
    role.assignPermission(key);
    expect(role.getPermissionKeys()).toHaveLength(1);
    role.removePermission(key);
    expect(role.getPermissionKeys()).toHaveLength(0);
  });

  it('applies grant and revoke changes in order', () => {
    const role = Role.create('r4', 'ops');
    const view = PermissionKey.create('catalog:product:view');
    const create = PermissionKey.create('catalog:product:create');

    role.applyPermissionChange(view, true);
    role.applyPermissionChange(create, true);
    role.applyPermissionChange(view, false);

    expect(role.getPermissionKeys().map((key) => key.value)).toEqual(['catalog:product:create']);
  });
});
