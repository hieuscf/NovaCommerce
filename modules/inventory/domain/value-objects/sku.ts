import { ValueObject } from '@novacommerce/building-blocks';
import { InventoryDomainError } from '../errors/inventory-domain.error';

export class Sku extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }

  static create(value: string): Sku {
    const trimmed = value?.trim();
    if (!trimmed) throw new InventoryDomainError('SKU is required', 'INVALID_SKU');
    return new Sku({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
