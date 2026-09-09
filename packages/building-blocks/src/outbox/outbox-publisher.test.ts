import { describe, expect, it, vi } from 'vitest';
import type { OutboxRecord } from '../events/outbox-record';
import { InMemoryEventBus } from '../event-bus/in-memory-event-bus';
import type { IOutboxRepository } from './outbox';
import { OutboxPublisher } from './outbox-publisher';

function createRecord(overrides: Partial<OutboxRecord> = {}): OutboxRecord {
  return {
    id: 'outbox-1',
    aggregateId: 'order-1',
    aggregateType: 'Order',
    eventType: 'OrderCreated',
    payload: { orderNumber: 'ORD-1', customerId: 'cust-1' },
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    processedAt: null,
    retryCount: 0,
    lastError: null,
    ...overrides,
  };
}

function createRepository(
  messages: OutboxRecord[],
): IOutboxRepository & {
  processed: string[];
  failures: Array<{ id: string; error: string }>;
} {
  const state = {
    messages: [...messages],
    processed: [] as string[],
    failures: [] as Array<{ id: string; error: string }>,
  };

  return {
    processed: state.processed,
    failures: state.failures,
    async findUnprocessed(limit: number) {
      return state.messages.filter((message) => message.processedAt === null).slice(0, limit);
    },
    async markProcessed(id: string) {
      state.processed.push(id);
      state.messages = state.messages.map((message) =>
        message.id === id ? { ...message, processedAt: new Date() } : message,
      );
    },
    async recordFailure(id: string, error: string) {
      state.failures.push({ id, error });
    },
  };
}

describe('OutboxPublisher', () => {
  it('publishes then marks processed on success', async () => {
    const repository = createRepository([createRecord()]);
    const eventBus = new InMemoryEventBus();
    const handler = vi.fn(async () => undefined);

    eventBus.subscribe('order.created', handler);

    const publisher = new OutboxPublisher(repository, eventBus);
    const processedCount = await publisher.processBatch();

    expect(processedCount).toBe(1);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(repository.processed).toEqual(['outbox-1']);
    expect(repository.failures).toHaveLength(0);
  });

  it('leaves message unprocessed when publish fails', async () => {
    const repository = createRepository([createRecord()]);
    const eventBus = new InMemoryEventBus();

    eventBus.subscribe('order.created', async () => {
      throw new Error('publish failed');
    });

    const publisher = new OutboxPublisher(repository, eventBus);
    const processedCount = await publisher.processBatch();

    expect(processedCount).toBe(0);
    expect(repository.processed).toHaveLength(0);
    expect(repository.failures).toEqual([
      { id: 'outbox-1', error: 'publish failed' },
    ]);
  });

  it('records parse failures without marking processed', async () => {
    const repository = createRepository([
      createRecord({ payload: { orderId: 'invalid' } }),
    ]);
    const eventBus = new InMemoryEventBus();
    const publisher = new OutboxPublisher(repository, eventBus);

    const processedCount = await publisher.processBatch();

    expect(processedCount).toBe(0);
    expect(repository.processed).toHaveLength(0);
    expect(repository.failures[0]?.error).toContain('P0 schema');
  });

  it('processes multiple messages independently', async () => {
    const repository = createRepository([
      createRecord({ id: 'outbox-1' }),
      createRecord({ id: 'outbox-2' }),
    ]);
    const eventBus = new InMemoryEventBus();
    const handler = vi.fn(async () => undefined);

    eventBus.subscribe('order.created', handler);

    const publisher = new OutboxPublisher(repository, eventBus);
    const processedCount = await publisher.processBatch();

    expect(processedCount).toBe(2);
    expect(handler).toHaveBeenCalledTimes(2);
    expect(repository.processed).toEqual(['outbox-1', 'outbox-2']);
  });
});
