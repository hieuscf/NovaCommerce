import { randomUUID } from 'node:crypto';
import { Result } from '@novacommerce/building-blocks';
import { Notification } from '../../domain/aggregates/notification';
import { NotificationDelivery } from '../../domain/entities/notification-delivery';
import { NotificationDomainError } from '../../domain/errors/notification-domain.error';
import type { INotificationRepository } from '../../domain/repositories/i-notification-repository';
import type { NotificationChannel } from '../../domain/value-objects/notification-channel';

export interface RequestNotificationDeliveryInput {
  readonly channel: NotificationChannel;
  readonly recipient: string;
}

export interface RequestNotificationInput {
  readonly templateKey: string;
  readonly payload: Record<string, string>;
  readonly deliveries: readonly RequestNotificationDeliveryInput[];
}

export class RequestNotificationService {
  constructor(private readonly repository: INotificationRepository) {}

  async execute(input: RequestNotificationInput): Promise<Result<string, NotificationDomainError>> {
    if (input.deliveries.length === 0) {
      return Result.fail(
        new NotificationDomainError('At least one delivery is required', 'DELIVERY_REQUIRED'),
      );
    }

    const notificationId = randomUUID();
    const deliveries = input.deliveries.map((delivery) =>
      NotificationDelivery.create(randomUUID(), delivery.channel, delivery.recipient),
    );

    const createResult = Notification.request(
      notificationId,
      input.templateKey,
      input.payload,
      deliveries,
    );

    if (createResult.isFailure) {
      return Result.fail(createResult.getError());
    }

    await this.repository.save(createResult.getValue());
    return Result.ok(notificationId);
  }
}
