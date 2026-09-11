import { BaseEntity } from '@novacommerce/building-blocks';
import type { PermissionKey } from '../value-objects/permission-key';

export class Permission extends BaseEntity<string> {
  private constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    private readonly key: PermissionKey,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, key: PermissionKey): Permission {
    return new Permission(id, new Date(), new Date(), key);
  }

  static reconstitute(props: {
    id: string;
    key: PermissionKey;
    createdAt: Date;
    updatedAt: Date;
  }): Permission {
    return new Permission(props.id, props.createdAt, props.updatedAt, props.key);
  }

  getKey(): PermissionKey {
    return this.key;
  }
}
