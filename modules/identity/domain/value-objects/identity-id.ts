import { ValueObject } from '@novacommerce/building-blocks';
import { IdentityDomainError } from '../errors/identity-domain.error';

export class IdentityId extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }

  static create(value: string): IdentityId {
    const trimmed = value?.trim();
    if (!trimmed) {
      throw new IdentityDomainError('Identity id is required', 'INVALID_IDENTITY_ID');
    }
    return new IdentityId({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
