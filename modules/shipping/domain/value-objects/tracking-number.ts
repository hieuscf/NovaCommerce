import { ValueObject } from '@novacommerce/building-blocks';
import { ShippingDomainError } from '../errors/shipping-domain.error';

export class TrackingNumber extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }

  static create(value: string): TrackingNumber {
    const trimmed = value?.trim();
    if (!trimmed) throw new ShippingDomainError('Tracking number is required', 'INVALID_TRACKING_NUMBER');
    return new TrackingNumber({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
