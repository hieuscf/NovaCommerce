import { describe, expect, it, vi } from 'vitest';
import { Result } from '@novacommerce/building-blocks';
import { ConsoleLogger } from '../../infrastructure/logging/console-logger';
import { NotificationProcessor } from './notification-processor';

describe('NotificationProcessor', () => {
  it('processes pending deliveries in batch', async () => {
    const repository = {
      findPendingDeliveries: vi.fn().mockResolvedValue([
        { notificationId: 'notification-1', deliveryId: 'delivery-1' },
        { notificationId: 'notification-2', deliveryId: 'delivery-2' },
      ]),
    };

    const processDeliveryService = {
      execute: vi.fn().mockResolvedValue(Result.ok(undefined)),
    };

    const processor = new NotificationProcessor(
      repository,
      processDeliveryService,
      new ConsoleLogger(),
      { batchSize: 10 },
    );

    const processedCount = await processor.processBatch();
    expect(processedCount).toBe(2);
    expect(processDeliveryService.execute).toHaveBeenCalledTimes(2);
  });
});
