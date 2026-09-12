import { describe, expect, it } from 'vitest';
import { parseOrderCreatedInventoryContract } from './order-created.contract';

describe('parseOrderCreatedInventoryContract', () => {
  const lines = [{ sku: 'NOVA-HP-001', quantity: 2, warehouseId: '22222222-2222-2222-2222-222222222222' }];

  it('parses domain OrderCreated events', () => {
    const contract = parseOrderCreatedInventoryContract({
      eventName: 'OrderCreated',
      aggregateId: '33333333-3333-3333-3333-333333333333',
      occurredOn: new Date(),
      payload: {
        orderNumber: 'ORD-1001',
        customerId: '44444444-4444-4444-4444-444444444444',
        lines,
      },
    });

    expect(contract).toEqual({
      orderId: '33333333-3333-3333-3333-333333333333',
      orderNumber: 'ORD-1001',
      customerId: '44444444-4444-4444-4444-444444444444',
      lines,
    });
  });

  it('parses integration order.created events', () => {
    const contract = parseOrderCreatedInventoryContract({
      eventId: '55555555-5555-5555-5555-555555555555',
      eventType: 'order.created',
      eventVersion: 1,
      aggregateId: '33333333-3333-3333-3333-333333333333',
      aggregateType: 'Order',
      occurredAt: new Date().toISOString(),
      payload: {
        orderNumber: 'ORD-1001',
        customerId: '44444444-4444-4444-4444-444444444444',
        lines,
      },
    });

    expect(contract?.orderId).toBe('33333333-3333-3333-3333-333333333333');
    expect(contract?.lines).toEqual(lines);
  });

  it('returns null when reservation lines are missing', () => {
    const contract = parseOrderCreatedInventoryContract({
      eventId: '55555555-5555-5555-5555-555555555555',
      eventType: 'order.created',
      eventVersion: 1,
      aggregateId: '33333333-3333-3333-3333-333333333333',
      aggregateType: 'Order',
      occurredAt: new Date().toISOString(),
      payload: {
        orderNumber: 'ORD-1001',
        customerId: '44444444-4444-4444-4444-444444444444',
      },
    });

    expect(contract).toBeNull();
  });
});
