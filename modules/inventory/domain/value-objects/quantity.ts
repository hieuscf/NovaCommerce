import { ValueObject } from '@novacommerce/building-blocks';
import { InventoryDomainError } from '../errors/inventory-domain.error';

export class Quantity extends ValueObject<{ value: number }> {
  private constructor(props: { value: number }) {
    super(props);
  }

  static create(value: number): Quantity {
    if (!Number.isFinite(value) || value < 0) {
      throw new InventoryDomainError('Invalid Quantity', 'INVALID_QUANTITY');
    }
    return new Quantity({ value });
  }

  get value(): number {
    return this.props.value;
  }
}
