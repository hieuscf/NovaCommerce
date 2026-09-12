import { ValueObject } from '@novacommerce/building-blocks';
import { ShippingDomainError } from '../errors/shipping-domain.error';

type ShippingMethodProps = {
  code: string;
  name: string;
};

export class ShippingMethod extends ValueObject<ShippingMethodProps & Record<string, unknown>> {
  private constructor(props: ShippingMethodProps) {
    super(props);
  }

  static create(code: string, name?: string): ShippingMethod {
    const trimmedCode = code?.trim();
    if (!trimmedCode) {
      throw new ShippingDomainError('Shipping method code is required', 'INVALID_SHIPPING_METHOD');
    }
    const trimmedName = name?.trim() || trimmedCode;
    return new ShippingMethod({ code: trimmedCode, name: trimmedName });
  }

  get code(): string {
    return this.props.code;
  }

  get name(): string {
    return this.props.name;
  }
}
