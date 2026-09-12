import { describe, expect, it, vi } from 'vitest';
import { PaymentSucceededNotificationHandler } from './payment-succeeded-notification.handler';
import { RecipientResolverService } from '../services/recipient-resolver.service';
import { RequestNotificationService } from '../services/request-notification.service';
import { Result } from '@novacommerce/building-blocks';

describe('PaymentSucceededNotificationHandler', () => {
  it('requests notifications for payment.completed', async () => {
    const execute = vi.fn().mockResolvedValue(Result.ok('notification-1'));
    const handler = new PaymentSucceededNotificationHandler(
      { execute } as unknown as RequestNotificationService,
      new RecipientResolverService(),
    );

    await handler.handle({
      eventId: 'event-1',
      eventType: 'payment.completed',
      eventVersion: 1,
      aggregateId: 'payment-1',
      aggregateType: 'Payment',
      occurredAt: new Date().toISOString(),
      payload: { orderId: 'order-1' },
    });

    expect(execute).toHaveBeenCalledWith({
      templateKey: 'payment.completed',
      payload: {
        orderId: 'order-1',
        paymentId: 'payment-1',
      },
      deliveries: expect.arrayContaining([
        expect.objectContaining({ channel: 'email' }),
        expect.objectContaining({ channel: 'push' }),
      ]),
    });
  });
});
