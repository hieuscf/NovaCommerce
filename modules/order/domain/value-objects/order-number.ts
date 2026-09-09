import { ValueObject } from '@novacommerce/building-blocks';
import { OrderDomainError } from '../errors/order-domain.error';

export class OrderNumber extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }

  static create(value: string): OrderNumber {
    const trimmed = value?.trim();
    if (!trimmed) throw new OrderDomainError('Order number is required', 'INVALID_ORDER_NUMBER');
    return new OrderNumber({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
