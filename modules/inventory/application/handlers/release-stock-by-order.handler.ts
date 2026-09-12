import { Result } from '@novacommerce/building-blocks';
import type { IInventoryItemRepository } from '../../domain/repositories/i-inventory-item-repository';
import { InventoryApplicationError } from '../errors/inventory-application.error';

export interface ReleaseStockByOrderCommand {
  readonly orderId: string;
}

export class ReleaseStockByOrderHandler {
  constructor(private readonly inventoryItemRepository: IInventoryItemRepository) {}

  async execute(
    command: ReleaseStockByOrderCommand,
  ): Promise<Result<{ readonly releasedCount: number }, InventoryApplicationError>> {
    try {
      const items = await this.inventoryItemRepository.findWithActiveReservationsForOrder(command.orderId);
      if (items.length === 0) {
        return Result.fail(
          new InventoryApplicationError('No active reservations for order', 'RESERVATION_NOT_FOUND'),
        );
      }

      let releasedCount = 0;
      for (const item of items) {
        const releaseResult = item.releaseReservationsForOrder(command.orderId);
        if (releaseResult.isFailure) {
          return Result.fail(
            new InventoryApplicationError(releaseResult.getError().message, releaseResult.getError().code),
          );
        }
        releasedCount += releaseResult.getValue().length;
        await this.inventoryItemRepository.save(item);
      }

      return Result.ok({ releasedCount });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to release stock for order';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'RELEASE_STOCK_BY_ORDER_FAILED';
      return Result.fail(new InventoryApplicationError(message, code));
    }
  }
}
