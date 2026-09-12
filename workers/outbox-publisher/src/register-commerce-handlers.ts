import type { IEventBus } from '@novacommerce/building-blocks';
import type { PrismaClient } from '@prisma/client';
import { OrderCreatedHandler } from '../../../modules/inventory/application/handlers/order-created.handler';
import { ReserveStockHandler } from '../../../modules/inventory/application/handlers/reserve-stock.handler';
import { registerInventoryEventHandlers } from '../../../modules/inventory/application/register-inventory-event-handlers';
import { PrismaOutboxStore } from '../../../modules/inventory/infrastructure/prisma/prisma-outbox-store';
import { PrismaInventoryItemRepository } from '../../../modules/inventory/infrastructure/repositories/prisma-inventory-item-repository';

/**
 * Wires Core Commerce event handlers onto the worker event bus.
 * Currently: OrderCreated → inventory reservation.
 */
export function registerCommerceEventHandlers(
  eventBus: IEventBus,
  prisma: PrismaClient,
): void {
  const inventoryOutboxStore = new PrismaOutboxStore(prisma);
  const inventoryRepository = new PrismaInventoryItemRepository(prisma, inventoryOutboxStore);
  const reserveStockHandler = new ReserveStockHandler(inventoryRepository);
  const orderCreatedHandler = new OrderCreatedHandler(reserveStockHandler);

  registerInventoryEventHandlers(eventBus, orderCreatedHandler);
}
