import { ValueObject } from '@novacommerce/building-blocks';
import { IdentityDomainError } from '../errors/identity-domain.error';

const MIN_PASSWORD_LENGTH = 8;

export class PlainPassword extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }

  static create(value: string): PlainPassword {
    if (!value || value.length < MIN_PASSWORD_LENGTH) {
      throw new IdentityDomainError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
        'INVALID_PASSWORD',
      );
    }
    return new PlainPassword({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
