import { describe, expect, it } from 'vitest';
import {
  parseIntegrationEvent,
  parseIntegrationEventJson,
  serializeIntegrationEvent,
} from './integration-event-envelope';
import { buildIntegrationEventFromOutbox } from './outbox-to-integration-event';
import type { OutboxRecord } from './outbox-record';

describe('IntegrationEvent envelope', () => {
  const sample = {
    eventId: 'evt-1',
    eventType: 'order.created',
    eventVersion: 1,
    aggregateId: 'order-1',
    aggregateType: 'Order',
    occurredAt: '2026-01-01T00:00:00.000Z',
    payload: { orderNumber: 'ORD-1', customerId: 'cust-1' },
    metadata: { correlationId: 'corr-1' },
  };

  it('serializes and parses integration events', () => {
    const json = serializeIntegrationEvent(sample);
    const parsed = parseIntegrationEventJson(json);

    expect(parsed).toEqual(sample);
  });

  it('rejects invalid envelopes', () => {
    expect(parseIntegrationEvent({ eventType: 'order.created' })).toBeNull();
    expect(parseIntegrationEventJson('{ invalid json')).toBeNull();
  });

  it('builds integration events from outbox records', () => {
    const record: OutboxRecord = {
      id: 'outbox-1',
      aggregateId: 'order-1',
      aggregateType: 'Order',
      eventType: 'OrderCreated',
      payload: { orderNumber: 'ORD-1', customerId: 'cust-1' },
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      processedAt: null,
      retryCount: 0,
      lastError: null,
    };

    const event = buildIntegrationEventFromOutbox(record);

    expect(event).toMatchObject({
      eventId: 'outbox-1',
      eventType: 'order.created',
      eventVersion: 1,
      aggregateId: 'order-1',
      aggregateType: 'Order',
      payload: { orderNumber: 'ORD-1', customerId: 'cust-1' },
    });
  });

  it('maps ProductCreated to catalog.product_created', () => {
    const record: OutboxRecord = {
      id: 'outbox-product-1',
      aggregateId: 'product-1',
      aggregateType: 'Product',
      eventType: 'ProductCreated',
      payload: {
        name: 'Nova Headphones',
        slug: 'nova-headphones',
        status: 'draft',
        price: 99.99,
        currency: 'USD',
        images: [],
        attributes: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      processedAt: null,
      retryCount: 0,
      lastError: null,
    };

    const event = buildIntegrationEventFromOutbox(record);

    expect(event.eventType).toBe('catalog.product_created');
    expect(event.aggregateId).toBe('product-1');
  });

  it('throws when P0 payload is invalid', () => {
    const record: OutboxRecord = {
      id: 'outbox-2',
      aggregateId: 'order-1',
      aggregateType: 'Order',
      eventType: 'OrderCreated',
      payload: { orderId: 'order-1' },
      createdAt: new Date(),
      processedAt: null,
      retryCount: 0,
      lastError: null,
    };

    expect(() => buildIntegrationEventFromOutbox(record)).toThrow(
      'payload does not match P0 schema',
    );
  });
});
