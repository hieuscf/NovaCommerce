import { describe, expect, it } from 'vitest';
import { Notification } from './notification';
import { NotificationDelivery } from '../entities/notification-delivery';
import { NotificationRequestedEvent } from '../events/notification-requested.event';
import { NotificationSentEvent } from '../events/notification-sent.event';
import { NotificationFailedEvent } from '../events/notification-failed.event';

describe('Notification aggregate', () => {
  it('requests notification with template, payload, and deliveries', () => {
    const delivery = NotificationDelivery.create('delivery-1', 'email', 'user@example.com');
    const result = Notification.request('notification-1', 'order.created', {
      orderNumber: 'ORD-001',
    }, [delivery]);

    expect(result.isSuccess).toBe(true);
    const notification = result.getValue();
    expect(notification.getTemplate()).toBe('order.created');
    expect(notification.getPayload()).toEqual({ orderNumber: 'ORD-001' });
    expect(notification.getDeliveries()).toHaveLength(1);

    const events = notification.pullDomainEvents();
    expect(events[0]).toBeInstanceOf(NotificationRequestedEvent);
  });

  it('rejects empty template', () => {
    const delivery = NotificationDelivery.create('delivery-1', 'email', 'user@example.com');
    const result = Notification.request('notification-1', ' ', { orderNumber: 'ORD-001' }, [delivery]);
    expect(result.isFailure).toBe(true);
  });

  it('marks delivery as sent and emits NotificationSent', () => {
    const delivery = NotificationDelivery.create('delivery-1', 'email', 'user@example.com');
    const notification = Notification.request('notification-1', 'order.created', {}, [delivery]).getValue();
    notification.pullDomainEvents();

    const result = notification.markSent('delivery-1');
    expect(result.isSuccess).toBe(true);

    const events = notification.pullDomainEvents();
    expect(events[0]).toBeInstanceOf(NotificationSentEvent);
  });

  it('marks delivery as failed and emits NotificationFailed', () => {
    const delivery = NotificationDelivery.create('delivery-1', 'email', 'user@example.com');
    const notification = Notification.request('notification-1', 'order.created', {}, [delivery]).getValue();
    notification.pullDomainEvents();

    const result = notification.markFailed('delivery-1', 'Provider unavailable');
    expect(result.isSuccess).toBe(true);

    const events = notification.pullDomainEvents();
    expect(events[0]).toBeInstanceOf(NotificationFailedEvent);
  });
});
