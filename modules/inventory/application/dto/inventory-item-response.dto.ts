export interface InventoryItemResponseDto {
  readonly id: string;
  readonly sku: string;
  readonly warehouseId: string;
  readonly onHand: number;
  readonly reserved: number;
  readonly available: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}
