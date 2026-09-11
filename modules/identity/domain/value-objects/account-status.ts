import { ValueObject } from '@novacommerce/building-blocks';
import { IdentityDomainError } from '../errors/identity-domain.error';

export const ACCOUNT_STATUSES = [
  'ACTIVE',
  'INACTIVE',
  'LOCKED',
  'SUSPENDED',
  'PENDING_VERIFICATION',
] as const;

export type AccountStatusValue = (typeof ACCOUNT_STATUSES)[number];

export class AccountStatus extends ValueObject<{ value: AccountStatusValue }> {
  private constructor(props: { value: AccountStatusValue }) {
    super(props);
  }

  static active(): AccountStatus {
    return new AccountStatus({ value: 'ACTIVE' });
  }

  static pendingVerification(): AccountStatus {
    return new AccountStatus({ value: 'PENDING_VERIFICATION' });
  }

  static from(value: string): AccountStatus {
    if (!ACCOUNT_STATUSES.includes(value as AccountStatusValue)) {
      throw new IdentityDomainError('Invalid account status', 'INVALID_ACCOUNT_STATUS');
    }
    return new AccountStatus({ value: value as AccountStatusValue });
  }

  get value(): AccountStatusValue {
    return this.props.value;
  }

  canAuthenticate(): boolean {
    return this.value === 'ACTIVE';
  }

  activate(): AccountStatus {
    if (this.value !== 'PENDING_VERIFICATION' && this.value !== 'INACTIVE') {
      throw new IdentityDomainError(
        'Account cannot be activated from current status',
        'INVALID_STATUS_TRANSITION',
      );
    }
    return AccountStatus.active();
  }

  lock(): AccountStatus {
    if (this.value !== 'ACTIVE') {
      throw new IdentityDomainError(
        'Only active accounts can be locked',
        'INVALID_STATUS_TRANSITION',
      );
    }
    return new AccountStatus({ value: 'LOCKED' });
  }

  unlock(): AccountStatus {
    if (this.value !== 'LOCKED') {
      throw new IdentityDomainError(
        'Only locked accounts can be unlocked',
        'INVALID_STATUS_TRANSITION',
      );
    }
    return AccountStatus.active();
  }

  suspend(): AccountStatus {
    if (this.value !== 'ACTIVE') {
      throw new IdentityDomainError(
        'Only active accounts can be suspended',
        'INVALID_STATUS_TRANSITION',
      );
    }
    return new AccountStatus({ value: 'SUSPENDED' });
  }
}
