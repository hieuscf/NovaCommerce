import { ValueObject } from '@novacommerce/building-blocks';
import { UserDomainError } from '../errors/user-domain.error';

export class PhoneNumber extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }

  static create(value: string): PhoneNumber {
    const trimmed = value?.trim();
    if (!/^\+?[0-9]{7,15}$/.test(trimmed)) throw new UserDomainError('Invalid phone number', 'INVALID_PHONE_NUMBER');
    return new PhoneNumber({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
