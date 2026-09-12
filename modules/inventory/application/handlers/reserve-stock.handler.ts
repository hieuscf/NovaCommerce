import { randomUUID } from 'node:crypto';
import { Result } from '@novacommerce/building-blocks';
import type { IInventoryItemRepository } from '../../domain/repositories/i-inventory-item-repository';
import { Quantity } from '../../domain/value-objects/quantity';
import { ReservationId } from '../../domain/value-objects/reservation-id';
import { Sku } from '../../domain/value-objects/sku';
import { WarehouseId } from '../../domain/value-objects/warehouse-id';
import type { InventoryItemResponseDto } from '../dto/inventory-item-response.dto';
import { InventoryApplicationError } from '../errors/inventory-application.error';
import { mapInventoryItemToDto } from '../mappers/map-inventory-item-to-dto';

export interface ReserveStockCommand {
  readonly orderId: string;
  readonly sku: string;
  readonly warehouseId: string;
  readonly quantity: number;
}

export class ReserveStockHandler {
  constructor(private readonly inventoryItemRepository: IInventoryItemRepository) {}

  async execute(
    command: ReserveStockCommand,
  ): Promise<Result<InventoryItemResponseDto, InventoryApplicationError>> {
    try {
      const sku = Sku.create(command.sku);
      const warehouseId = WarehouseId.create(command.warehouseId);
      const quantity = Quantity.create(command.quantity);

      const item = await this.inventoryItemRepository.findBySkuAndWarehouse(sku, warehouseId);
      if (!item) {
        return Result.fail(new InventoryApplicationError('Inventory item not found', 'INVENTORY_ITEM_NOT_FOUND'));
      }

      const reservationId = ReservationId.create(randomUUID());
      const reserveResult = item.reserve(randomUUID(), reservationId, command.orderId, quantity);
      if (reserveResult.isFailure) {
        return Result.fail(
          new InventoryApplicationError(reserveResult.getError().message, reserveResult.getError().code),
        );
      }

      await this.inventoryItemRepository.save(item);
      return Result.ok(mapInventoryItemToDto(item));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reserve stock';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'RESERVE_STOCK_FAILED';
      return Result.fail(new InventoryApplicationError(message, code));
    }
  }
}
