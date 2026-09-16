import type { BusEvent, IEventBus } from '@novacommerce/building-blocks';
import {
  PRODUCT_CREATED_INTEGRATION_TYPE,
  PRODUCT_UPDATED_INTEGRATION_TYPE,
} from './contracts/product-search-event.contract';
import type { ProductCreatedHandler } from './handlers/product-created.handler';
import type { ProductUpdatedHandler } from './handlers/product-updated.handler';

/**
 * Registers Search module event handlers on the shared event bus.
 * Subscribes to Catalog integration events; Search does not call Catalog.
 */
export function registerSearchEventHandlers(
  eventBus: IEventBus,
  productCreatedHandler: ProductCreatedHandler,
  productUpdatedHandler: ProductUpdatedHandler,
): void {
  eventBus.subscribe(PRODUCT_CREATED_INTEGRATION_TYPE, async (event: BusEvent) => {
    await productCreatedHandler.handle(event);
  });

  eventBus.subscribe(PRODUCT_UPDATED_INTEGRATION_TYPE, async (event: BusEvent) => {
    await productUpdatedHandler.handle(event);
  });
}
