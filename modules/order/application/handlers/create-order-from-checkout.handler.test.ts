import { describe, expect, it, vi } from 'vitest';
import { Order, OrderStatus } from '../../domain/aggregates/order';
import { CreateOrderFromCheckoutHandler } from './create-order-from-checkout.handler';

describe('CreateOrderFromCheckoutHandler', () => {
  const customerId = '22222222-2222-2222-2222-222222222222';

  it('creates order and persists through repository', async () => {
    const orderRepository = {
      findById: vi.fn(),
      findByOrderNumber: vi.fn(),
      listByCustomerId: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
    };

    const handler = new CreateOrderFromCheckoutHandler(orderRepository);
    const result = await handler.execute({
      customerId,
      totalAmount: 99.99,
      totalCurrency: 'USD',
      lines: [
        {
          productId: '44444444-4444-4444-4444-444444444444',
          sku: 'NOVA-HP-001',
          quantity: 1,
          unitPriceAmount: 99.99,
          unitPriceCurrency: 'USD',
          warehouseId: '66666666-6666-6666-6666-666666666666',
        },
      ],
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().orderNumber).toMatch(/^ORD-/);
    expect(orderRepository.save).toHaveBeenCalledOnce();

    const savedOrder = orderRepository.save.mock.calls[0]?.[0] as Order;
    expect(savedOrder.getStatus()).toBe(OrderStatus.PENDING);
    expect(savedOrder.getLines()).toHaveLength(1);
  });

  it('returns ORDER_NO_LINES when lines are empty', async () => {
    const orderRepository = {
      findById: vi.fn(),
      findByOrderNumber: vi.fn(),
      listByCustomerId: vi.fn(),
      save: vi.fn(),
    };

    const handler = new CreateOrderFromCheckoutHandler(orderRepository);
    const result = await handler.execute({
      customerId,
      totalAmount: 0,
      totalCurrency: 'USD',
      lines: [],
    });

    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('ORDER_NO_LINES');
  });
});
