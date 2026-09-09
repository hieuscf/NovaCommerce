import { ValueObject } from '@novacommerce/building-blocks';
import { UserDomainError } from '../errors/user-domain.error';

export class DisplayName extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }

  static create(value: string): DisplayName {
    const trimmed = value?.trim();
    if (!trimmed || trimmed.length > 100) throw new UserDomainError('Invalid display name', 'INVALID_DISPLAY_NAME');
    return new DisplayName({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
