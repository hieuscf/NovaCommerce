import type { InventoryItem } from '../aggregates/inventory-item';
import type { Sku } from '../value-objects/sku';
import type { WarehouseId } from '../value-objects/warehouse-id';

export interface IInventoryItemRepository {
  findBySkuAndWarehouse(sku: Sku, warehouseId: WarehouseId): Promise<InventoryItem | null>;
  save(item: InventoryItem): Promise<void>;
}
