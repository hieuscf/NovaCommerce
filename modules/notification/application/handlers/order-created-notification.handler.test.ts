import { describe, expect, it, vi } from 'vitest';
import { OrderCreatedNotificationHandler } from './order-created-notification.handler';
import { RecipientResolverService } from '../services/recipient-resolver.service';
import { RequestNotificationService } from '../services/request-notification.service';
import { Result } from '@novacommerce/building-blocks';

describe('OrderCreatedNotificationHandler', () => {
  it('requests email and push notifications for order.created', async () => {
    const execute = vi.fn().mockResolvedValue(Result.ok('notification-1'));
    const handler = new OrderCreatedNotificationHandler(
      { execute } as unknown as RequestNotificationService,
      new RecipientResolverService(),
    );

    await handler.handle({
      eventName: 'OrderCreated',
      aggregateId: 'order-1',
      occurredOn: new Date(),
      payload: {
        orderNumber: 'ORD-001',
        customerId: 'customer-1',
      },
    });

    expect(execute).toHaveBeenCalledWith({
      templateKey: 'order.created',
      payload: {
        orderNumber: 'ORD-001',
        customerId: 'customer-1',
        orderId: 'order-1',
      },
      deliveries: expect.arrayContaining([
        expect.objectContaining({ channel: 'email' }),
        expect.objectContaining({ channel: 'push' }),
      ]),
    });
  });
});
