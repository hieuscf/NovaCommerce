import { AggregateRoot, Result } from '@novacommerce/building-blocks';
import { NotificationDomainError } from '../errors/notification-domain.error';
import { DeliveryStatus, NotificationDelivery } from '../entities/notification-delivery';
import { NotificationFailedEvent } from '../events/notification-failed.event';
import { NotificationRequestedEvent } from '../events/notification-requested.event';
import { NotificationSentEvent } from '../events/notification-sent.event';

export class Notification extends AggregateRoot<string> {
  private deliveries: NotificationDelivery[] = [];

  private constructor(
    id: string, createdAt: Date, updatedAt: Date,
    private template: string, private payload: Record<string, string>,
  ) { super(id, createdAt, updatedAt); }

  static request(id: string, template: string, payload: Record<string, string>, delivery: NotificationDelivery): Result<Notification, NotificationDomainError> {
    if (!template?.trim()) {
      return Result.fail(new NotificationDomainError('Template is required', 'INVALID_TEMPLATE'));
    }
    const now = new Date();
    const notification = new Notification(id, now, now, template.trim(), { ...payload });
    notification.deliveries.push(delivery);
    notification.addDomainEvent(new NotificationRequestedEvent(id, now, {
      channel: delivery.getChannel(),
      recipient: delivery.getRecipient(),
      template: template.trim(),
    }));
    return Result.ok(notification);
  }

  static reconstitute(props: {
    id: string; template: string; payload: Record<string, string>;
    createdAt: Date; updatedAt: Date; deliveries: NotificationDelivery[];
  }): Notification {
    const notification = new Notification(props.id, props.createdAt, props.updatedAt, props.template, props.payload);
    notification.deliveries = [...props.deliveries];
    return notification;
  }

  markSent(deliveryId: string): Result<void, NotificationDomainError> {
    const delivery = this.deliveries.find((d) => d.id === deliveryId);
    if (!delivery) {
      return Result.fail(new NotificationDomainError('Delivery not found', 'DELIVERY_NOT_FOUND'));
    }
    delivery.markSent();
    this.updatedAt = new Date();
    this.addDomainEvent(new NotificationSentEvent(this.id, new Date(), { deliveryId }));
    return Result.ok(undefined);
  }

  markFailed(deliveryId: string, reason: string): Result<void, NotificationDomainError> {
    const delivery = this.deliveries.find((d) => d.id === deliveryId);
    if (!delivery) {
      return Result.fail(new NotificationDomainError('Delivery not found', 'DELIVERY_NOT_FOUND'));
    }
    delivery.markFailed(reason);
    this.updatedAt = new Date();
    this.addDomainEvent(new NotificationFailedEvent(this.id, new Date(), { reason }));
    return Result.ok(undefined);
  }

  getDeliveries(): readonly NotificationDelivery[] { return this.deliveries; }
  getTemplate(): string { return this.template; }
}
