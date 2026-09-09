import { ValueObject } from '@novacommerce/building-blocks';
import { InventoryDomainError } from '../errors/inventory-domain.error';

export class WarehouseId extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }

  static create(value: string): WarehouseId {
    const trimmed = value?.trim();
    if (!trimmed) throw new InventoryDomainError('Warehouse id is required', 'INVALID_WAREHOUSE_ID');
    return new WarehouseId({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
