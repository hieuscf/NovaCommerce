import { BaseEntity } from '@novacommerce/building-blocks';
import type { PermissionKey } from '../value-objects/permission-key';

export class Role extends BaseEntity<string> {
  private permissionKeys: PermissionKey[] = [];

  private constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    private readonly name: string,
    private readonly description: string | undefined,
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
