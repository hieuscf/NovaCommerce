import { ValueObject } from '@novacommerce/building-blocks';
import { UserDomainError } from '../errors/user-domain.error';

const ALLOWED_KEYS = new Set([
  'language',
  'currency',
  'marketing.email',
  'marketing.sms',
  'notifications.email',
  'notifications.push',
  'notifications.sms',
]);

export class PreferenceKey extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }

  static create(value: string): PreferenceKey {
    const trimmed = value?.trim();
    if (!trimmed || trimmed.length > 64) {
      throw new UserDomainError('Invalid preference key', 'INVALID_PREFERENCE_KEY');
    }
    if (!ALLOWED_KEYS.has(trimmed)) {
      throw new UserDomainError('Unsupported preference key', 'UNSUPPORTED_PREFERENCE_KEY');
    }
    return new PreferenceKey({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
