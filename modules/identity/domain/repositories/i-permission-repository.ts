import type { Permission } from '../entities/permission';
import type { PermissionKey } from '../value-objects/permission-key';

export interface IPermissionRepository {
  findById(id: string): Promise<Permission | null>;
  findByKey(key: PermissionKey): Promise<Permission | null>;
  findAll(): Promise<Permission[]>;
  save(permission: Permission): Promise<void>;
}
