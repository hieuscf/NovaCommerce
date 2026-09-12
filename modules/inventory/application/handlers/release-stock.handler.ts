import { Result } from '@novacommerce/building-blocks';
import type { IInventoryItemRepository } from '../../domain/repositories/i-inventory-item-repository';
import { ReservationId } from '../../domain/value-objects/reservation-id';
import type { InventoryItemResponseDto } from '../dto/inventory-item-response.dto';
import { InventoryApplicationError } from '../errors/inventory-application.error';
import { mapInventoryItemToDto } from '../mappers/map-inventory-item-to-dto';

export interface ReleaseStockCommand {
  readonly inventoryItemId: string;
  readonly reservationId: string;
}

export class ReleaseStockHandler {
  constructor(private readonly inventoryItemRepository: IInventoryItemRepository) {}

  async execute(
    command: ReleaseStockCommand,
  ): Promise<Result<InventoryItemResponseDto, InventoryApplicationError>> {
    try {
      const item = await this.inventoryItemRepository.findById(command.inventoryItemId);
      if (!item) {
        return Result.fail(new InventoryApplicationError('Inventory item not found', 'INVENTORY_ITEM_NOT_FOUND'));
      }

      const reservationId = ReservationId.create(command.reservationId);
      const releaseResult = item.releaseReservation(reservationId);
      if (releaseResult.isFailure) {
        return Result.fail(
          new InventoryApplicationError(releaseResult.getError().message, releaseResult.getError().code),
        );
      }

      await this.inventoryItemRepository.save(item);
      return Result.ok(mapInventoryItemToDto(item));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to release stock';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'RELEASE_STOCK_FAILED';
      return Result.fail(new InventoryApplicationError(message, code));
    }
  }
}
