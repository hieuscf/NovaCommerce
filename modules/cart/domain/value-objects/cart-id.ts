import { ValueObject } from '@novacommerce/building-blocks';
import { CartDomainError } from '../errors/cart-domain.error';

export class CartId extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }

  static create(value: string): CartId {
    const trimmed = value?.trim();
    if (!trimmed) throw new CartDomainError('Cart id is required', 'INVALID_CART_ID');
    return new CartId({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
