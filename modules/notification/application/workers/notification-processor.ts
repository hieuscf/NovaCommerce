import type { ILogger } from '@novacommerce/building-blocks';
import type { INotificationRepository } from '../../domain/repositories/i-notification-repository';
import { ProcessNotificationDeliveryService } from '../services/process-notification-delivery.service';

export interface NotificationProcessorOptions {
  readonly batchSize?: number;
}

export class NotificationProcessor {
  private readonly batchSize: number;

  constructor(
    private readonly repository: INotificationRepository,
    private readonly processDeliveryService: ProcessNotificationDeliveryService,
    private readonly logger: ILogger,
    options: NotificationProcessorOptions = {},
  ) {
    this.batchSize = options.batchSize ?? 10;
  }

  async processBatch(): Promise<number> {
    const pending = await this.repository.findPendingDeliveries(this.batchSize);
    let processedCount = 0;

    for (const record of pending) {
      const result = await this.processDeliveryService.execute({
        notificationId: record.notificationId,
        deliveryId: record.deliveryId,
      });

      if (result.isFailure) {
        this.logger.error('Notification processor failed to process delivery', {
          module: 'notification',
          notificationId: record.notificationId,
          deliveryId: record.deliveryId,
          error: result.getError().message,
        });
        continue;
      }

      processedCount += 1;
    }

    return processedCount;
  }
}
