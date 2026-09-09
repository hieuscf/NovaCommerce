import { ValueObject } from '@novacommerce/building-blocks';
import { PaymentDomainError } from '../errors/payment-domain.error';

export class PaymentReference extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }

  static create(value: string): PaymentReference {
    const trimmed = value?.trim();
    if (!trimmed) throw new PaymentDomainError('Payment reference is required', 'INVALID_PAYMENT_REFERENCE');
    return new PaymentReference({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
