import { randomUUID } from 'node:crypto';
import { Result } from '@novacommerce/building-blocks';
import type { IInventoryItemRepository } from '../../domain/repositories/i-inventory-item-repository';
import type { InventoryItemResponseDto } from '../dto/inventory-item-response.dto';
import { InventoryApplicationError } from '../errors/inventory-application.error';
import { mapInventoryItemToDto } from '../mappers/map-inventory-item-to-dto';

export interface AdjustStockCommand {
  readonly inventoryItemId: string;
  readonly delta: number;
  readonly reason: string;
}

export class AdjustStockHandler {
  constructor(private readonly inventoryItemRepository: IInventoryItemRepository) {}

  async execute(
    command: AdjustStockCommand,
  ): Promise<Result<InventoryItemResponseDto, InventoryApplicationError>> {
    try {
      const item = await this.inventoryItemRepository.findById(command.inventoryItemId);
      if (!item) {
        return Result.fail(new InventoryApplicationError('Inventory item not found', 'INVENTORY_ITEM_NOT_FOUND'));
      }

      const adjustResult = item.adjust(command.delta, command.reason.trim(), randomUUID());
      if (adjustResult.isFailure) {
        return Result.fail(
          new InventoryApplicationError(adjustResult.getError().message, adjustResult.getError().code),
        );
      }

      await this.inventoryItemRepository.save(item);
      return Result.ok(mapInventoryItemToDto(item));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to adjust stock';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'ADJUST_STOCK_FAILED';
      return Result.fail(new InventoryApplicationError(message, code));
    }
  }
}
