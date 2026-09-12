import { describe, expect, it, vi } from 'vitest';
import { Notification } from '../../domain/aggregates/notification';
import { NotificationDelivery } from '../../domain/entities/notification-delivery';
import { DeliveryStatus } from '../../domain/entities/notification-delivery';
import { ConsoleLogger } from '../../infrastructure/logging/console-logger';
import { StubEmailChannel } from '../../infrastructure/services/stub-email-channel';
import { StubPushChannel } from '../../infrastructure/services/stub-push-channel';
import { DeliveryRetryPolicy } from './delivery-retry-policy';
import { NotificationTemplateService } from './notification-template.service';
import { ProcessNotificationDeliveryService } from './process-notification-delivery.service';

describe('ProcessNotificationDeliveryService', () => {
  it('marks delivery as sent after successful email delivery', async () => {
    const delivery = NotificationDelivery.create('delivery-1', 'email', 'user@example.com');
    const notification = Notification.request('notification-1', 'order.created', {
      orderNumber: 'ORD-001',
    }, [delivery]).getValue();

    const repository = {
      findById: vi.fn().mockResolvedValue(notification),
      save: vi.fn().mockResolvedValue(undefined),
    };

    const service = new ProcessNotificationDeliveryService(
      repository,
      new NotificationTemplateService(),
      new StubEmailChannel(),
      new StubPushChannel(),
      new DeliveryRetryPolicy({ maxAttempts: 1, baseDelayMs: 0 }),
      new ConsoleLogger(),
    );

    const result = await service.execute({
      notificationId: 'notification-1',
      deliveryId: 'delivery-1',
    });

    expect(result.isSuccess).toBe(true);
    expect(notification.getDeliveries()[0]?.getStatus()).toBe(DeliveryStatus.SENT);
    expect(repository.save).toHaveBeenCalled();
  });

  it('retries failed delivery and marks failed after max attempts', async () => {
    const delivery = NotificationDelivery.create('delivery-1', 'email', 'user@example.com');
    const notification = Notification.request('notification-1', 'order.created', {
      orderNumber: 'ORD-001',
    }, [delivery]).getValue();

    const repository = {
      findById: vi.fn().mockResolvedValue(notification),
      save: vi.fn().mockResolvedValue(undefined),
    };

    const service = new ProcessNotificationDeliveryService(
      repository,
      new NotificationTemplateService(),
      new StubEmailChannel({ shouldFail: true, failureMessage: 'SMTP down' }),
      new StubPushChannel(),
      new DeliveryRetryPolicy({ maxAttempts: 2, baseDelayMs: 0 }),
      new ConsoleLogger(),
    );

    const result = await service.execute({
      notificationId: 'notification-1',
      deliveryId: 'delivery-1',
    });

    expect(result.isSuccess).toBe(true);
    expect(notification.getDeliveries()[0]?.getStatus()).toBe(DeliveryStatus.FAILED);
    expect(notification.getDeliveries()[0]?.getFailureReason()).toBe('SMTP down');
  });
});
