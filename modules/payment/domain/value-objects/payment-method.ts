import { ValueObject } from '@novacommerce/building-blocks';
import { PaymentDomainError } from '../errors/payment-domain.error';

export class PaymentMethod extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }

  static create(value: string): PaymentMethod {
    const trimmed = value?.trim();
    if (!trimmed) throw new PaymentDomainError('Payment method is required', 'INVALID_PAYMENT_METHOD');
    return new PaymentMethod({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
