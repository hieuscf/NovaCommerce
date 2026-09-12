import type { WarehouseId } from '../value-objects/warehouse-id';

/**
 * Warehouse reference on an inventory item.
 * Persistence stores only `warehouse_id` on `inventory_items` (see database-design.md §8.7).
 */
export class Warehouse {
  private constructor(private readonly id: WarehouseId) {}

  static fromId(id: WarehouseId): Warehouse {
    return new Warehouse(id);
  }

  getId(): WarehouseId {
    return this.id;
  }
}
