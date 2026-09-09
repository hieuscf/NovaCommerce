import { describe, expect, it, vi } from 'vitest';
import type { DomainEvent } from '../events/domain-event';
import type { IntegrationEvent } from '../events/integration-event';
import { InMemoryEventBus } from './in-memory-event-bus';

function createDomainEvent(eventName: string): DomainEvent {
  return {
    aggregateId: 'agg-1',
    occurredOn: new Date('2026-01-01T00:00:00.000Z'),
    eventName,
  };
}

function createIntegrationEvent(eventType: string): IntegrationEvent {
  return {
    eventId: 'evt-1',
    eventType,
    eventVersion: 1,
    aggregateId: 'agg-1',
    aggregateType: 'Order',
    occurredAt: '2026-01-01T00:00:00.000Z',
    payload: { orderNumber: 'ORD-1', customerId: 'cust-1' },
  };
}

describe('InMemoryEventBus', () => {
  it('invokes a single handler for a domain event', async () => {
    const bus = new InMemoryEventBus();
    const handler = vi.fn(async () => undefined);

    bus.subscribe('OrderCreated', handler);
    await bus.publish(createDomainEvent('OrderCreated'));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('invokes multiple handlers for the same event type sequentially', async () => {
    const bus = new InMemoryEventBus();
    const order: string[] = [];

    bus.subscribe('OrderCreated', async () => {
      order.push('a');
    });
    bus.subscribe('OrderCreated', async () => {
      order.push('b');
    });

    await bus.publish(createDomainEvent('OrderCreated'));

    expect(order).toEqual(['a', 'b']);
  });

  it('does nothing when no handlers are registered for an unknown event type', async () => {
    const bus = new InMemoryEventBus();

    await expect(bus.publish(createDomainEvent('UnknownEvent'))).resolves.toBeUndefined();
  });

  it('propagates handler failures', async () => {
    const bus = new InMemoryEventBus();

    bus.subscribe('OrderCreated', async () => {
      throw new Error('handler failed');
    });

    await expect(bus.publish(createDomainEvent('OrderCreated'))).rejects.toThrow(
      'handler failed',
    );
  });

  it('supports async handlers for integration events', async () => {
    const bus = new InMemoryEventBus();
    const handler = {
      handle: vi.fn(async () => undefined),
    };

    bus.subscribe('order.created', handler);
    await bus.publish(createIntegrationEvent('order.created'));

    expect(handler.handle).toHaveBeenCalledTimes(1);
  });

  it('publishes all events in order via publishAll', async () => {
    const bus = new InMemoryEventBus();
    const received: string[] = [];

    bus.subscribe('OrderCreated', async () => {
      received.push('first');
    });
    bus.subscribe('StockReserved', async () => {
      received.push('second');
    });

    await bus.publishAll([
      createDomainEvent('OrderCreated'),
      createDomainEvent('StockReserved'),
    ]);

    expect(received).toEqual(['first', 'second']);
  });
});
