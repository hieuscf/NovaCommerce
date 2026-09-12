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
import { GetOrderHistoryHandler } from './get-order-history.handler';

describe('GetOrderHistoryHandler', () => {
  const identityId = '550e8400-e29b-41d4-a716-446655440001';
  const userId = UserId.create('22222222-2222-2222-2222-222222222222');
  const user = User.create(userId, identityId, UserProfile.create(userId.value, DisplayName.create('Jane Doe'))).getValue();

  it('returns paginated order history for customer', async () => {
    const order = Order.createFromCheckout({
      id: OrderId.create('11111111-1111-1111-1111-111111111111'),
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
      findById: vi.fn(),
      findByOrderNumber: vi.fn(),
      listByCustomerId: vi.fn().mockResolvedValue({ items: [order], total: 1 }),
      save: vi.fn(),
    };

    const handler = new GetOrderHistoryHandler(userRepository, orderRepository);
    const result = await handler.execute({ identityId, page: 1, pageSize: 20 });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().items).toHaveLength(1);
    expect(result.getValue().total).toBe(1);
    expect(orderRepository.listByCustomerId).toHaveBeenCalledWith(user.id, {
      status: undefined,
      page: 1,
      pageSize: 20,
    });
  });
});
