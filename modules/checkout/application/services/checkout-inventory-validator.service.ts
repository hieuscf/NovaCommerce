import type { IInventoryItemRepository } from '../../../inventory/domain/repositories/i-inventory-item-repository';
import { Sku } from '../../../inventory/domain/value-objects/sku';
import { WarehouseId } from '../../../inventory/domain/value-objects/warehouse-id';
import { CheckoutApplicationError } from '../errors/checkout-application.error';

export interface InventoryValidationLine {
  readonly sku: string;
  readonly quantity: number;
}

export async function validateInventoryAvailability(
  inventoryRepository: IInventoryItemRepository,
  warehouseId: string,
  lines: readonly InventoryValidationLine[],
): Promise<CheckoutApplicationError | null> {
  const warehouse = WarehouseId.create(warehouseId);

  for (const line of lines) {
    const sku = Sku.create(line.sku);
    const item = await inventoryRepository.findBySkuAndWarehouse(sku, warehouse);
    if (!item) {
      return new CheckoutApplicationError(`Inventory not found for SKU ${line.sku}`, 'INVENTORY_ITEM_NOT_FOUND');
    }

    if (item.getAvailableQuantity() < line.quantity) {
      return new CheckoutApplicationError(`Insufficient stock for SKU ${line.sku}`, 'INSUFFICIENT_STOCK');
    }
  }

  return null;
}
