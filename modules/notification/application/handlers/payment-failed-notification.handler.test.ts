import { describe, expect, it, vi } from 'vitest';
import { PaymentFailedNotificationHandler } from './payment-failed-notification.handler';
import { RecipientResolverService } from '../services/recipient-resolver.service';
import { RequestNotificationService } from '../services/request-notification.service';
import { Result } from '@novacommerce/building-blocks';

describe('PaymentFailedNotificationHandler', () => {
  it('requests notifications for payment.failed', async () => {
    const execute = vi.fn().mockResolvedValue(Result.ok('notification-1'));
    const handler = new PaymentFailedNotificationHandler(
      { execute } as unknown as RequestNotificationService,
      new RecipientResolverService(),
    );

    await handler.handle({
      eventName: 'PaymentFailed',
      aggregateId: 'payment-1',
      occurredOn: new Date(),
      payload: { reason: 'Card declined' },
    });

    expect(execute).toHaveBeenCalledWith({
      templateKey: 'payment.failed',
      payload: {
        paymentId: 'payment-1',
        reason: 'Card declined',
      },
      deliveries: expect.arrayContaining([
        expect.objectContaining({ channel: 'email' }),
        expect.objectContaining({ channel: 'push' }),
      ]),
    });
  });
});
