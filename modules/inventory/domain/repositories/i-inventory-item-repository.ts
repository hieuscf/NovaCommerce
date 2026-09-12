import type { InventoryItem } from '../aggregates/inventory-item';
import type { Sku } from '../value-objects/sku';
import type { WarehouseId } from '../value-objects/warehouse-id';

export interface IInventoryItemRepository {
  findById(id: string): Promise<InventoryItem | null>;
  findBySkuAndWarehouse(sku: Sku, warehouseId: WarehouseId): Promise<InventoryItem | null>;
  findWithActiveReservationsForOrder(orderId: string): Promise<InventoryItem[]>;
  save(item: InventoryItem): Promise<void>;
}
