import { randomUUID } from 'node:crypto';
import {
  InMemoryEventBus,
  OutboxPublisher,
  type IntegrationEvent,
} from '@novacommerce/building-blocks';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { PrismaOutboxRepository } from './outbox/prisma-outbox-repository';
import { createTestPrismaClient, resetDatabase } from './test/database-test-utils';

describe('outbox publisher integration', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = createTestPrismaClient();
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('marks message processed only after successful publish', async () => {
    const outboxId = randomUUID();
    const orderId = randomUUID();

    await prisma.outboxMessage.create({
      data: {
        id: outboxId,
        aggregateId: orderId,
        aggregateType: 'Order',
        eventType: 'OrderCreated',
        payload: { orderNumber: 'ORD-001', customerId: randomUUID() },
      },
    });

    const eventBus = new InMemoryEventBus();
    const received: IntegrationEvent[] = [];

    eventBus.subscribe('order.created', async (event) => {
      received.push(event as IntegrationEvent);
    });

    const publisher = new OutboxPublisher(new PrismaOutboxRepository(prisma), eventBus);
    await publisher.processBatch();

    const outbox = await prisma.outboxMessage.findUnique({ where: { id: outboxId } });

    expect(received).toHaveLength(1);
    expect(received[0]?.eventType).toBe('order.created');
    expect(outbox?.processedAt).not.toBeNull();
  });

  it('keeps processed_at null when publish fails', async () => {
    const outboxId = randomUUID();

    await prisma.outboxMessage.create({
      data: {
        id: outboxId,
        aggregateId: randomUUID(),
        aggregateType: 'Order',
        eventType: 'OrderCreated',
        payload: { orderNumber: 'ORD-002', customerId: randomUUID() },
      },
    });

    const eventBus = new InMemoryEventBus();
    eventBus.subscribe('order.created', async () => {
      throw new Error('handler failure');
    });

    const publisher = new OutboxPublisher(new PrismaOutboxRepository(prisma), eventBus);
    await publisher.processBatch();

    const outbox = await prisma.outboxMessage.findUnique({ where: { id: outboxId } });

    expect(outbox?.processedAt).toBeNull();
    expect(outbox?.retryCount).toBe(1);
    expect(outbox?.lastError).toBe('handler failure');
  });

  it('records parse failures without marking processed', async () => {
    const outboxId = randomUUID();

    await prisma.outboxMessage.create({
      data: {
        id: outboxId,
        aggregateId: randomUUID(),
        aggregateType: 'Order',
        eventType: 'OrderCreated',
        payload: { orderId: randomUUID() },
      },
    });

    const eventBus = new InMemoryEventBus();
    const handler = vi.fn(async () => undefined);
    eventBus.subscribe('order.created', handler);

    const publisher = new OutboxPublisher(new PrismaOutboxRepository(prisma), eventBus);
    await publisher.processBatch();

    const outbox = await prisma.outboxMessage.findUnique({ where: { id: outboxId } });

    expect(handler).not.toHaveBeenCalled();
    expect(outbox?.processedAt).toBeNull();
    expect(outbox?.retryCount).toBe(1);
    expect(outbox?.lastError).toContain('P0 schema');
  });
});
