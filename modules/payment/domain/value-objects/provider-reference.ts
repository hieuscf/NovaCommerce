import { ValueObject } from '@novacommerce/building-blocks';
import { PaymentDomainError } from '../errors/payment-domain.error';

export class ProviderReference extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }

  static create(value: string): ProviderReference {
    const trimmed = value?.trim();
    if (!trimmed) throw new PaymentDomainError('Provider reference is required', 'INVALID_PROVIDER_REFERENCE');
    return new ProviderReference({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
