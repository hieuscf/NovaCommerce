import { ValueObject } from '@novacommerce/building-blocks';
import { IdentityDomainError } from '../errors/identity-domain.error';

export class PermissionKey extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }

  static create(value: string): PermissionKey {
    const normalized = value?.trim().toLowerCase();
    if (!/^[\w-]+(:[\w-]+)+$/.test(normalized)) {
      throw new IdentityDomainError(
        'Permission key must follow resource:action format',
        'INVALID_PERMISSION_KEY',
      );
    }
    return new PermissionKey({ value: normalized });
  }

  get value(): string {
    return this.props.value;
  }

  get resource(): string {
    const separatorIndex = this.value.indexOf(':');
    return separatorIndex === -1 ? '' : this.value.slice(0, separatorIndex);
  }

  get action(): string {
    const separatorIndex = this.value.indexOf(':');
    return separatorIndex === -1 ? '' : this.value.slice(separatorIndex + 1);
  }
}
