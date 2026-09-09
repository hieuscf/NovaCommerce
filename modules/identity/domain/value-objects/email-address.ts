import { ValueObject } from '@novacommerce/building-blocks';
import { IdentityDomainError } from '../errors/identity-domain.error';

export class EmailAddress extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }

  static create(value: string): EmailAddress {
    const trimmed = value?.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      throw new IdentityDomainError('Invalid email address', 'INVALID_EMAIL');
    }
    return new EmailAddress({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
