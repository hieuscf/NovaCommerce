import type { IOutboxRepository, OutboxRecord } from '@novacommerce/building-blocks';
import type { PrismaClient } from '@prisma/client';

export class PrismaOutboxRepository implements IOutboxRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findUnprocessed(limit: number): Promise<readonly OutboxRecord[]> {
    const rows = await this.prisma.outboxMessage.findMany({
      where: { processedAt: null },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    return rows.map((row) => ({
      id: row.id,
      aggregateId: row.aggregateId,
      aggregateType: row.aggregateType,
      eventType: row.eventType,
      payload: row.payload,
      createdAt: row.createdAt,
      processedAt: row.processedAt,
      retryCount: row.retryCount,
      lastError: row.lastError,
    }));
  }

  async markProcessed(id: string): Promise<void> {
    await this.prisma.outboxMessage.update({
      where: { id },
      data: { processedAt: new Date(), lastError: null },
    });
  }

  async recordFailure(id: string, error: string): Promise<void> {
    await this.prisma.outboxMessage.update({
      where: { id },
      data: {
        retryCount: { increment: 1 },
        lastError: error,
      },
    });
  }
}
