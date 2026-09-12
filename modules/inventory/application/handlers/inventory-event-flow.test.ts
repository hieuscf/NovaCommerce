import { describe, expect, it, vi } from 'vitest';
import { InMemoryEventBus, Result } from '@novacommerce/building-blocks';
import { OrderCreatedHandler } from './order-created.handler';

describe('Inventory event flow', () => {
  it('handles OrderCreated through event bus and reserves stock', async () => {
    const reserveStockHandler = {
      execute: vi.fn().mockResolvedValue(
        Result.ok({
          id: '11111111-1111-1111-1111-111111111111',
          sku: 'NOVA-HP-001',
          warehouseId: '22222222-2222-2222-2222-222222222222',
          onHand: 10,
          reserved: 1,
          available: 9,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      ),
    };

    const orderCreatedHandler = new OrderCreatedHandler(reserveStockHandler);
    const eventBus = new InMemoryEventBus();
    eventBus.subscribe('OrderCreated', async (event) => {
      await orderCreatedHandler.handle(event);
    });

    await eventBus.publish({
      eventName: 'OrderCreated',
      aggregateId: '33333333-3333-3333-3333-333333333333',
      occurredOn: new Date(),
      payload: {
        orderNumber: 'ORD-1001',
        customerId: '44444444-4444-4444-4444-444444444444',
        lines: [{ sku: 'NOVA-HP-001', quantity: 1, warehouseId: '22222222-2222-2222-2222-222222222222' }],
      },
    });

    expect(reserveStockHandler.execute).toHaveBeenCalledOnce();
  });
});
