import type { BusEvent, IEventBus } from '@novacommerce/building-blocks';
import type { OrderCreatedNotificationHandler } from './handlers/order-created-notification.handler';
import type { PaymentFailedNotificationHandler } from './handlers/payment-failed-notification.handler';
import type { PaymentSucceededNotificationHandler } from './handlers/payment-succeeded-notification.handler';

export function registerNotificationEventHandlers(
  eventBus: IEventBus,
  orderCreatedHandler: OrderCreatedNotificationHandler,
  paymentSucceededHandler: PaymentSucceededNotificationHandler,
  paymentFailedHandler: PaymentFailedNotificationHandler,
): void {
  eventBus.subscribe('order.created', async (event: BusEvent) => {
    await orderCreatedHandler.handle(event);
  });

  eventBus.subscribe('payment.completed', async (event: BusEvent) => {
    await paymentSucceededHandler.handle(event);
  });

  eventBus.subscribe('payment.failed', async (event: BusEvent) => {
    await paymentFailedHandler.handle(event);
  });
}
