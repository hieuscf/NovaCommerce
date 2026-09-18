import { BaseEntity, Result } from '@novacommerce/building-blocks';
import { IdentityDomainError } from '../errors/identity-domain.error';
import type { PermissionKey } from '../value-objects/permission-key';

const PROTECTED_ROLE_NAMES = new Set([
  'admin',
  'administrator',
  'super_admin',
  'super-admin',
  'superadmin',
]);

export class Role extends BaseEntity<string> {
  private permissionKeys: PermissionKey[] = [];

  private constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    private name: string,
    private description: string | undefined,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, name: string, description?: string): Role {
    return new Role(id, new Date(), new Date(), name.trim().toLowerCase(), description);
  }

  static reconstitute(props: {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    permissionKeys: PermissionKey[];
  }): Role {
    const role = new Role(
      props.id,
      props.createdAt,
      props.updatedAt,
      props.name,
      props.description,
    );
    role.permissionKeys = [...props.permissionKeys];
    return role;
  }

  static isProtectedName(name: string): boolean {
    return PROTECTED_ROLE_NAMES.has(name.trim().toLowerCase());
  }

  isProtected(): boolean {
    return Role.isProtectedName(this.name);
  }

  assignPermission(permissionKey: PermissionKey): void {
    if (!this.permissionKeys.some((key) => key.value === permissionKey.value)) {
      this.permissionKeys.push(permissionKey);
      this.updatedAt = new Date();
    }
  }

  removePermission(permissionKey: PermissionKey): void {
    this.permissionKeys = this.permissionKeys.filter((key) => key.value !== permissionKey.value);
    this.updatedAt = new Date();
  }

  applyPermissionChange(permissionKey: PermissionKey, granted: boolean): void {
    if (granted) {
      this.assignPermission(permissionKey);
      return;
    }

    this.removePermission(permissionKey);
  }

  changeDescription(description: string | undefined): void {
    const next = description?.trim() || undefined;
    this.description = next;
    this.updatedAt = new Date();
  }

  rename(name: string): Result<void, IdentityDomainError> {
    if (this.isProtected()) {
      return Result.fail(
        new IdentityDomainError('System roles cannot be renamed', 'SYSTEM_ROLE_PROTECTED'),
      );
    }

    const next = name.trim().toLowerCase();
    if (next.length < 2) {
      return Result.fail(
        new IdentityDomainError('Role name must be at least 2 characters', 'INVALID_ROLE_NAME'),
      );
    }

    this.name = next;
    this.updatedAt = new Date();
    return Result.ok(undefined);
  }

  assertDeletable(): Result<void, IdentityDomainError> {
    if (this.isProtected()) {
      return Result.fail(
        new IdentityDomainError('System roles cannot be deleted', 'SYSTEM_ROLE_PROTECTED'),
      );
    }
    return Result.ok(undefined);
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string | undefined {
    return this.description;
  }

  getPermissionKeys(): readonly PermissionKey[] {
    return this.permissionKeys;
  }
}
