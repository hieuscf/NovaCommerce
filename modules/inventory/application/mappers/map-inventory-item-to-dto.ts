import type { InventoryItem } from '../../domain/aggregates/inventory-item';
import type { InventoryItemResponseDto } from '../dto/inventory-item-response.dto';

export function mapInventoryItemToDto(item: InventoryItem): InventoryItemResponseDto {
  return {
    id: item.id,
    sku: item.getSku().value,
    warehouseId: item.getWarehouseId().value,
    onHand: item.getOnHand().value,
    reserved: item.getReserved().value,
    available: item.getAvailableQuantity(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}
