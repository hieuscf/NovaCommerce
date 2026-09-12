import { Result } from '@novacommerce/building-blocks';
import type { ILogger } from '@novacommerce/building-blocks';
import { NotificationDomainError } from '../../domain/errors/notification-domain.error';
import type { INotificationRepository } from '../../domain/repositories/i-notification-repository';
import { NotificationChannel, isNotificationChannel } from '../../domain/value-objects/notification-channel';
import type { IEmailChannel } from '../contracts/i-email-channel';
import type { IPushChannel } from '../contracts/i-push-channel';
import { DeliveryRetryPolicy } from './delivery-retry-policy';
import { NotificationTemplateService } from './notification-template.service';

export interface ProcessNotificationDeliveryInput {
  readonly notificationId: string;
  readonly deliveryId: string;
}

export class ProcessNotificationDeliveryService {
  constructor(
    private readonly repository: INotificationRepository,
    private readonly templateService: NotificationTemplateService,
    private readonly emailChannel: IEmailChannel,
    private readonly pushChannel: IPushChannel,
    private readonly retryPolicy: DeliveryRetryPolicy,
    private readonly logger: ILogger,
  ) {}

  async execute(input: ProcessNotificationDeliveryInput): Promise<Result<void, NotificationDomainError>> {
    const notification = await this.repository.findById(input.notificationId);
    if (!notification) {
      return Result.fail(
        new NotificationDomainError('Notification not found', 'NOTIFICATION_NOT_FOUND'),
      );
    }

    const delivery = notification.getDeliveries().find((item) => item.id === input.deliveryId);
    if (!delivery) {
      return Result.fail(
        new NotificationDomainError('Delivery not found', 'DELIVERY_NOT_FOUND'),
      );
    }

    if (!isNotificationChannel(delivery.getChannel())) {
      const failResult = notification.markFailed(input.deliveryId, 'Unsupported notification channel');
      if (failResult.isFailure) {
        return failResult;
      }
      await this.repository.save(notification);
      return Result.ok(undefined);
    }

    const channel = delivery.getChannel() as NotificationChannel;
    const contentResult = this.templateService.resolve(
      notification.getTemplate(),
      channel,
      { ...notification.getPayload() },
    );

    if (contentResult.isFailure) {
      const failResult = notification.markFailed(input.deliveryId, contentResult.getError().message);
      if (failResult.isFailure) {
        return failResult;
      }
      await this.repository.save(notification);
      return Result.ok(undefined);
    }

    const content = contentResult.getValue();
    const maxAttempts = this.retryPolicy.getMaxAttempts();
    let lastError = 'Delivery failed';

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const deliveryResult = await this.sendViaChannel(channel, delivery.getRecipient(), content.subject, content.body);

      if (deliveryResult.success) {
        const sentResult = notification.markSent(input.deliveryId);
        if (sentResult.isFailure) {
          return sentResult;
        }
        await this.repository.save(notification);
        this.logger.info('Notification delivery sent', {
          module: 'notification',
          notificationId: input.notificationId,
          deliveryId: input.deliveryId,
          channel,
        });
        return Result.ok(undefined);
      }

      lastError = deliveryResult.errorMessage ?? 'Delivery failed';
      this.logger.warn('Notification delivery attempt failed', {
        module: 'notification',
        notificationId: input.notificationId,
        deliveryId: input.deliveryId,
        channel,
        attempt,
        maxAttempts,
        errorMessage: lastError,
      });

      if (attempt < maxAttempts) {
        await this.retryPolicy.waitBeforeRetry(attempt);
      }
    }

    const failedResult = notification.markFailed(input.deliveryId, lastError);
    if (failedResult.isFailure) {
      return failedResult;
    }
    await this.repository.save(notification);
    this.logger.error('Notification delivery failed after retries', {
      module: 'notification',
      notificationId: input.notificationId,
      deliveryId: input.deliveryId,
      channel,
      maxAttempts,
      errorMessage: lastError,
    });
    return Result.ok(undefined);
  }

  private async sendViaChannel(
    channel: NotificationChannel,
    recipient: string,
    subject: string | undefined,
    body: string,
  ): Promise<{ success: boolean; errorMessage?: string }> {
    if (channel === NotificationChannel.EMAIL) {
      const result = await this.emailChannel.send({
        to: recipient,
        subject: subject ?? 'Notification',
        body,
      });
      return result;
    }

    const [title, ...bodyLines] = body.split('\n');
    const result = await this.pushChannel.send({
      deviceToken: recipient,
      title: title ?? 'Notification',
      body: bodyLines.join('\n') || body,
    });
    return result;
  }
}
