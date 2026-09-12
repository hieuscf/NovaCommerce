import { describe, expect, it } from 'vitest';
import { DeliveryStatus, NotificationDelivery } from './notification-delivery';

describe('NotificationDelivery', () => {
  it('creates pending delivery', () => {
    const delivery = NotificationDelivery.create('delivery-1', 'email', 'user@example.com');
    expect(delivery.getStatus()).toBe(DeliveryStatus.PENDING);
    expect(delivery.getChannel()).toBe('email');
    expect(delivery.getRecipient()).toBe('user@example.com');
  });

  it('transitions to sent and failed states', () => {
    const delivery = NotificationDelivery.create('delivery-1', 'push', 'customer:1');
    delivery.markSent();
    expect(delivery.getStatus()).toBe(DeliveryStatus.SENT);

    const failed = NotificationDelivery.create('delivery-2', 'push', 'customer:2');
    failed.markFailed('timeout');
    expect(failed.getStatus()).toBe(DeliveryStatus.FAILED);
    expect(failed.getFailureReason()).toBe('timeout');
  });
});
