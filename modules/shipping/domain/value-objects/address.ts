import { ValueObject } from '@novacommerce/building-blocks';
import { ShippingDomainError } from '../errors/shipping-domain.error';

type AddressProps = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export class Address extends ValueObject<AddressProps & Record<string, unknown>> {
  private constructor(props: AddressProps) {
    super(props);
  }

  static create(props: AddressProps): Address {
    if (!props.line1?.trim() || !props.city?.trim() || !props.state?.trim() || !props.postalCode?.trim() || !props.country?.trim()) {
      throw new ShippingDomainError('Address fields are required', 'INVALID_ADDRESS');
    }
    return new Address({
      line1: props.line1.trim(),
      line2: props.line2?.trim(),
      city: props.city.trim(),
      state: props.state.trim(),
      postalCode: props.postalCode.trim(),
      country: props.country.trim().toUpperCase(),
    });
  }

  get line1(): string { return this.props.line1; }
  get line2(): string | undefined { return this.props.line2; }
  get city(): string { return this.props.city; }
  get state(): string { return this.props.state; }
  get postalCode(): string { return this.props.postalCode; }
  get country(): string { return this.props.country; }
}
