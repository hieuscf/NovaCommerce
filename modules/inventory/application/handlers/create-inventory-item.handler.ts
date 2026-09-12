import { randomUUID } from 'node:crypto';
import { Result } from '@novacommerce/building-blocks';
import { InventoryItem } from '../../domain/aggregates/inventory-item';
import type { IInventoryItemRepository } from '../../domain/repositories/i-inventory-item-repository';
import { Quantity } from '../../domain/value-objects/quantity';
import { Sku } from '../../domain/value-objects/sku';
import { WarehouseId } from '../../domain/value-objects/warehouse-id';
import type { InventoryItemResponseDto } from '../dto/inventory-item-response.dto';
import { InventoryApplicationError } from '../errors/inventory-application.error';
import { mapInventoryItemToDto } from '../mappers/map-inventory-item-to-dto';

export interface CreateInventoryItemCommand {
  readonly sku: string;
  readonly warehouseId: string;
  readonly onHand: number;
}

export class CreateInventoryItemHandler {
  constructor(private readonly inventoryItemRepository: IInventoryItemRepository) {}

  async execute(
    command: CreateInventoryItemCommand,
  ): Promise<Result<InventoryItemResponseDto, InventoryApplicationError>> {
    try {
      const sku = Sku.create(command.sku);
      const warehouseId = WarehouseId.create(command.warehouseId);
      const onHand = Quantity.create(command.onHand);

      const existing = await this.inventoryItemRepository.findBySkuAndWarehouse(sku, warehouseId);
      if (existing) {
        return Result.fail(
          new InventoryApplicationError('Inventory item already exists for SKU and warehouse', 'DUPLICATE_ITEM'),
        );
      }

      const createResult = InventoryItem.create(randomUUID(), sku, warehouseId, onHand);
      if (createResult.isFailure) {
        return Result.fail(
          new InventoryApplicationError(createResult.getError().message, createResult.getError().code),
        );
      }

      const item = createResult.getValue();
      await this.inventoryItemRepository.save(item);

      return Result.ok(mapInventoryItemToDto(item));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create inventory item';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'CREATE_INVENTORY_ITEM_FAILED';
      return Result.fail(new InventoryApplicationError(message, code));
    }
  }
}
