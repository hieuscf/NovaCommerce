import { ValueObject } from '@novacommerce/building-blocks';
import { ShippingDomainError } from '../errors/shipping-domain.error';

export class CarrierCode extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }

  static create(value: string): CarrierCode {
    const trimmed = value?.trim();
    if (!trimmed) throw new ShippingDomainError('Carrier code is required', 'INVALID_CARRIER_CODE');
    return new CarrierCode({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
