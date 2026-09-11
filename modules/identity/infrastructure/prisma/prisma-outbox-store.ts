import type { IOutboxStore, OutboxMessage } from '@novacommerce/building-blocks';
import type { PrismaClient } from '@prisma/client';

export class PrismaOutboxStore implements IOutboxStore {
  constructor(private readonly prisma: PrismaClient) {}

  async save(messages: readonly OutboxMessage[]): Promise<void> {
    if (messages.length === 0) {
      return;
    }

    await this.prisma.outboxMessage.createMany({
      data: messages.map((message) => ({
        id: message.id,
        aggregateId: message.aggregateId,
        aggregateType: message.aggregateType,
        eventType: message.eventType,
        payload: message.payload as object,
        createdAt: message.occurredOn,
      })),
    });
  }
}
