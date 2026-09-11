import { describe, expect, it } from 'vitest';
import { IdentityDomainError } from '../errors/identity-domain.error';
import { PermissionKey } from './permission-key';

describe('PermissionKey', () => {
  it('accepts two-part keys', () => {
    const key = PermissionKey.create('admin:read');

    expect(key.value).toBe('admin:read');
    expect(key.resource).toBe('admin');
    expect(key.action).toBe('read');
  });

  it('accepts multi-segment action keys', () => {
    const key = PermissionKey.create('identity:role:create');

    expect(key.value).toBe('identity:role:create');
    expect(key.resource).toBe('identity');
    expect(key.action).toBe('role:create');
  });

  it('normalizes casing and whitespace', () => {
    const key = PermissionKey.create('  Admin:Status:Read  ');

    expect(key.value).toBe('admin:status:read');
  });

  it('rejects keys without a colon', () => {
    expect(() => PermissionKey.create('adminread')).toThrow(IdentityDomainError);
  });

  it('rejects empty keys', () => {
    expect(() => PermissionKey.create('')).toThrow(IdentityDomainError);
  });
});
