import { ValueObject } from '@novacommerce/building-blocks';
import { OrderDomainError } from '../errors/order-domain.error';

export class OrderId extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }

  static create(value: string): OrderId {
    const trimmed = value?.trim();
    if (!trimmed) throw new OrderDomainError('Order id is required', 'INVALID_ORDER_ID');
    return new OrderId({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
