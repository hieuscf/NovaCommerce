import type { DomainEvent } from '@novacommerce/building-blocks';
import { parseOrderCreatedInventoryContract } from '../contracts/order-created.contract';
import { InventoryApplicationError } from '../errors/inventory-application.error';
import type { ReserveStockHandler } from './reserve-stock.handler';

export class OrderCreatedHandler {
  constructor(private readonly reserveStockHandler: ReserveStockHandler) {}

  async handle(event: DomainEvent): Promise<void> {
    const contract = parseOrderCreatedInventoryContract(event);
    if (!contract) {
      throw new InventoryApplicationError('Invalid OrderCreated payload for inventory reservation', 'INVALID_ORDER_CREATED');
    }

    for (const line of contract.lines) {
      const result = await this.reserveStockHandler.execute({
        orderId: contract.orderId,
        sku: line.sku,
        warehouseId: line.warehouseId,
        quantity: line.quantity,
      });

      if (result.isFailure) {
        throw result.getError();
      }
    }
  }
}
