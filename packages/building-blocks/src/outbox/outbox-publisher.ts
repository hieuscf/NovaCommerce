import {
  buildIntegrationEventFromOutbox,
  OutboxEventParseError,
} from '../events/outbox-to-integration-event';
import type { OutboxRecord } from '../events/outbox-record';
import type { IEventBus } from '../event-bus/event-bus';
import type { IOutboxRepository } from './outbox';

export interface OutboxPublisherOptions {
  readonly batchSize?: number;
}

export class OutboxPublisher {
  private readonly batchSize: number;

  constructor(
    private readonly outboxRepository: IOutboxRepository,
    private readonly eventBus: IEventBus,
    options: OutboxPublisherOptions = {},
  ) {
    this.batchSize = options.batchSize ?? 10;
  }

  async processBatch(): Promise<number> {
    const pending = await this.outboxRepository.findUnprocessed(this.batchSize);
    let processedCount = 0;

    for (const message of pending) {
      const published = await this.processMessage(message);
      if (published) {
        processedCount += 1;
      }
    }

    return processedCount;
  }

  private async processMessage(message: OutboxRecord): Promise<boolean> {
    try {
      const integrationEvent = buildIntegrationEventFromOutbox(message);
      await this.eventBus.publish(integrationEvent);
      await this.outboxRepository.markProcessed(message.id);
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof OutboxEventParseError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Unknown outbox publish error';

      await this.outboxRepository.recordFailure(message.id, errorMessage);
      return false;
    }
  }
}
