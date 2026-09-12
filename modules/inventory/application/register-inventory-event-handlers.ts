import type { BusEvent, IEventBus } from '@novacommerce/building-blocks';
import type { OrderCreatedHandler } from './handlers/order-created.handler';

/**
 * Registers inventory module event handlers on the shared event bus.
 * Subscribes to integration event type `order.created` (mapped from domain `OrderCreated`).
 */
export function registerInventoryEventHandlers(
  eventBus: IEventBus,
  orderCreatedHandler: OrderCreatedHandler,
): void {
  eventBus.subscribe('order.created', async (event: BusEvent) => {
    await orderCreatedHandler.handle(event);
  });
}
