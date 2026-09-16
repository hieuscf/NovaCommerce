import { AggregateRoot, Result } from '@novacommerce/building-blocks';
import { PaymentDomainError } from '../errors/payment-domain.error';
import { SavedPaymentMethodAddedEvent } from '../events/saved-payment-method-added.event';
import { SavedPaymentMethodDefaultChangedEvent } from '../events/saved-payment-method-default-changed.event';
import { SavedPaymentMethodRemovedEvent } from '../events/saved-payment-method-removed.event';

export interface SavedPaymentMethodProps {
  readonly id: string;
  readonly customerId: string;
  readonly provider: string;
  readonly providerToken: string;
  readonly brand: string;
  readonly last4: string;
  readonly expMonth: number;
  readonly expYear: number;
  readonly cardholderName: string;
  readonly isDefault: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Vaulted card metadata. Never holds CVV/CVC or full PAN (ADR-006).
 */
export class SavedPaymentMethod extends AggregateRoot<string> {
  private constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    private customerId: string,
    private provider: string,
    private providerToken: string,
    private brand: string,
    private last4: string,
    private expMonth: number,
    private expYear: number,
    private cardholderName: string,
    private isDefault: boolean,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(props: {
    readonly id: string;
    readonly customerId: string;
    readonly provider: string;
    readonly providerToken: string;
    readonly brand: string;
    readonly last4: string;
    readonly expMonth: number;
    readonly expYear: number;
    readonly cardholderName: string;
    readonly isDefault: boolean;
  }): Result<SavedPaymentMethod, PaymentDomainError> {
    if (!props.customerId?.trim()) {
      return Result.fail(new PaymentDomainError('Customer id is required', 'INVALID_CUSTOMER_ID'));
    }
    if (!props.providerToken?.trim()) {
      return Result.fail(new PaymentDomainError('Provider token is required', 'INVALID_PROVIDER_TOKEN'));
    }
    if (!/^\d{4}$/.test(props.last4)) {
      return Result.fail(new PaymentDomainError('Card last4 must be 4 digits', 'INVALID_CARD_LAST4'));
    }
    if (props.expMonth < 1 || props.expMonth > 12) {
      return Result.fail(new PaymentDomainError('Invalid expiration month', 'INVALID_CARD_EXPIRY'));
    }
    if (props.expYear < 2000 || props.expYear > 2100) {
      return Result.fail(new PaymentDomainError('Invalid expiration year', 'INVALID_CARD_EXPIRY'));
    }
    if (!props.cardholderName?.trim()) {
      return Result.fail(new PaymentDomainError('Cardholder name is required', 'INVALID_CARDHOLDER_NAME'));
    }

    const now = new Date();
    const method = new SavedPaymentMethod(
      props.id,
      now,
      now,
      props.customerId.trim(),
      props.provider.trim() || 'stub',
      props.providerToken.trim(),
      props.brand.trim().toLowerCase() || 'card',
      props.last4,
      props.expMonth,
      props.expYear,
      props.cardholderName.trim(),
      props.isDefault,
    );
    method.addDomainEvent(
      new SavedPaymentMethodAddedEvent(props.id, now, {
        customerId: method.customerId,
        brand: method.brand,
        last4: method.last4,
      }),
    );
    return Result.ok(method);
  }

  static reconstitute(props: SavedPaymentMethodProps): SavedPaymentMethod {
    return new SavedPaymentMethod(
      props.id,
      props.createdAt,
      props.updatedAt,
      props.customerId,
      props.provider,
      props.providerToken,
      props.brand,
      props.last4,
      props.expMonth,
      props.expYear,
      props.cardholderName,
      props.isDefault,
    );
  }

  markDefault(): void {
    if (this.isDefault) {
      return;
    }
    this.isDefault = true;
    this.updatedAt = new Date();
    this.addDomainEvent(
      new SavedPaymentMethodDefaultChangedEvent(this.id, this.updatedAt, {
        customerId: this.customerId,
        isDefault: true,
      }),
    );
  }

  clearDefault(): void {
    if (!this.isDefault) {
      return;
    }
    this.isDefault = false;
    this.updatedAt = new Date();
  }

  markRemoved(): void {
    this.updatedAt = new Date();
    this.addDomainEvent(
      new SavedPaymentMethodRemovedEvent(this.id, this.updatedAt, {
        customerId: this.customerId,
      }),
    );
  }

  getCustomerId(): string {
    return this.customerId;
  }

  getProvider(): string {
    return this.provider;
  }

  getProviderToken(): string {
    return this.providerToken;
  }

  getBrand(): string {
    return this.brand;
  }

  getLast4(): string {
    return this.last4;
  }

  getExpMonth(): number {
    return this.expMonth;
  }

  getExpYear(): number {
    return this.expYear;
  }

  getCardholderName(): string {
    return this.cardholderName;
  }

  getIsDefault(): boolean {
    return this.isDefault;
  }
}
