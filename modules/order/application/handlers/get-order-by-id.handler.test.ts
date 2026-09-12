import { describe, expect, it, vi } from 'vitest';
import { User } from '../../../user/domain/aggregates/user';
import { UserProfile } from '../../../user/domain/entities/user-profile';
import { DisplayName } from '../../../user/domain/value-objects/display-name';
import { UserId } from '../../../user/domain/value-objects/user-id';
import { Order } from '../../domain/aggregates/order';
import { Money } from '../../domain/value-objects/money';
import { OrderId } from '../../domain/value-objects/order-id';
import { OrderNumber } from '../../domain/value-objects/order-number';
import { Quantity } from '../../domain/value-objects/quantity';
import { GetOrderByIdHandler } from './get-order-by-id.handler';

describe('GetOrderByIdHandler', () => {
  const identityId = '550e8400-e29b-41d4-a716-446655440001';
  const userId = UserId.create('22222222-2222-2222-2222-222222222222');
  const orderId = '11111111-1111-1111-1111-111111111111';
  const user = User.create(userId, identityId, UserProfile.create(userId.value, DisplayName.create('Jane Doe'))).getValue();

  it('returns order for authenticated customer', async () => {
    const order = Order.createFromCheckout({
      id: OrderId.create(orderId),
      orderNumber: OrderNumber.create('ORD-TEST001'),
      customerId: user.id,
      total: Money.create(99.99, 'USD'),
      lines: [
        {
          lineId: '33333333-3333-3333-3333-333333333333',
          productId: '44444444-4444-4444-4444-444444444444',
          quantity: Quantity.create(1),
          unitPrice: Money.create(99.99, 'USD'),
          sku: 'NOVA-HP-001',
          warehouseId: '66666666-6666-6666-6666-666666666666',
        },
      ],
    }).getValue();

    const userRepository = { findByIdentityId: vi.fn().mockResolvedValue(user) };
    const orderRepository = {
      findById: vi.fn().mockResolvedValue(order),
      findByOrderNumber: vi.fn(),
      listByCustomerId: vi.fn(),
      save: vi.fn(),
    };

    const handler = new GetOrderByIdHandler(userRepository, orderRepository);
    const result = await handler.execute({ identityId, orderId });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().id).toBe(orderId);
    expect(result.getValue().lines).toHaveLength(1);
  });

  it('returns ORDER_NOT_FOUND when order does not exist', async () => {
    const userRepository = { findByIdentityId: vi.fn().mockResolvedValue(user) };
    const orderRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByOrderNumber: vi.fn(),
      listByCustomerId: vi.fn(),
      save: vi.fn(),
    };

    const handler = new GetOrderByIdHandler(userRepository, orderRepository);
    const result = await handler.execute({ identityId, orderId });

    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('ORDER_NOT_FOUND');
  });
});
