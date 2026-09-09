import { ValueObject } from '@novacommerce/building-blocks';
import { UserDomainError } from '../errors/user-domain.error';

export class UserId extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }

  static create(value: string): UserId {
    const trimmed = value?.trim();
    if (!trimmed) throw new UserDomainError('User id is required', 'INVALID_USER_ID');
    return new UserId({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
