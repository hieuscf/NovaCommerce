import { randomUUID } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { Result } from '@novacommerce/building-blocks';
import { OrderCreatedHandler } from './order-created.handler';

describe('OrderCreatedHandler', () => {
  it('reserves stock for each order line', async () => {
    const reserveStockHandler = {
      execute: vi.fn().mockResolvedValue(
        Result.ok({
          id: '11111111-1111-1111-1111-111111111111',
          sku: 'NOVA-HP-001',
          warehouseId: '22222222-2222-2222-2222-222222222222',
          onHand: 10,
          reserved: 2,
          available: 8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      ),
    };

    const handler = new OrderCreatedHandler(reserveStockHandler);
    const event = {
      eventName: 'OrderCreated',
      aggregateId: '33333333-3333-3333-3333-333333333333',
      occurredOn: new Date(),
      payload: {
        orderNumber: 'ORD-1001',
        customerId: '44444444-4444-4444-4444-444444444444',
        lines: [
          {
            sku: 'NOVA-HP-001',
            quantity: 2,
            warehouseId: '22222222-2222-2222-2222-222222222222',
          },
        ],
      },
    };

    await handler.handle(event);

    expect(reserveStockHandler.execute).toHaveBeenCalledOnce();
    expect(reserveStockHandler.execute).toHaveBeenCalledWith({
      orderId: '33333333-3333-3333-3333-333333333333',
      sku: 'NOVA-HP-001',
      warehouseId: '22222222-2222-2222-2222-222222222222',
      quantity: 2,
    });
  });

  it('handles integration order.created events', async () => {
    const reserveStockHandler = { execute: vi.fn().mockResolvedValue(Result.ok({})) };
    const handler = new OrderCreatedHandler(reserveStockHandler);

    await handler.handle({
      eventId: randomUUID(),
      eventType: 'order.created',
      eventVersion: 1,
      aggregateId: '33333333-3333-3333-3333-333333333333',
      aggregateType: 'Order',
      occurredAt: new Date().toISOString(),
      payload: {
        orderNumber: 'ORD-1001',
        customerId: '44444444-4444-4444-4444-444444444444',
        lines: [{ sku: 'NOVA-HP-001', quantity: 1, warehouseId: '22222222-2222-2222-2222-222222222222' }],
      },
    });

    expect(reserveStockHandler.execute).toHaveBeenCalledOnce();
  });

  it('throws when OrderCreated payload lacks reservation lines', async () => {
    const handler = new OrderCreatedHandler({ execute: vi.fn() });
    await expect(
      handler.handle({
        eventName: 'OrderCreated',
        aggregateId: 'order-id',
        occurredOn: new Date(),
        payload: { orderNumber: 'ORD-1', customerId: 'cust-1' },
      }),
    ).rejects.toMatchObject({ code: 'INVALID_ORDER_CREATED' });
  });
});
