import { describe, expect, it, vi } from 'vitest';
import { User } from '../../../user/domain/aggregates/user';
import { UserProfile } from '../../../user/domain/entities/user-profile';
import { DisplayName } from '../../../user/domain/value-objects/display-name';
import { UserId } from '../../../user/domain/value-objects/user-id';
import { Cart } from '../../domain/aggregates/cart';
import { CartId } from '../../domain/value-objects/cart-id';
import { AddCartItemHandler } from './add-cart-item.handler';

describe('AddCartItemHandler', () => {
  const identityId = '22222222-2222-2222-2222-222222222222';
  const userId = UserId.create('11111111-1111-1111-1111-111111111111');
  const profile = UserProfile.create(userId.value, DisplayName.create('Jane Doe'));
  const user = User.create(userId, identityId, profile).getValue();

  it('adds item to customer cart', async () => {
    const cart = Cart.create(CartId.create('33333333-3333-3333-3333-333333333333'), user.id).getValue();
    cart.pullDomainEvents();

    const userRepository = {
      findByIdentityId: vi.fn().mockResolvedValue(user),
    };
    const cartRepository = {
      findByCustomerId: vi.fn().mockResolvedValue(cart),
      findById: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
    };

    const handler = new AddCartItemHandler(userRepository, cartRepository);
    const result = await handler.execute({
      identityId,
      productId: '44444444-4444-4444-4444-444444444444',
      quantity: 2,
      unitPriceAmount: 19.99,
      unitPriceCurrency: 'USD',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().items).toHaveLength(1);
    expect(cartRepository.save).toHaveBeenCalledOnce();
  });

  it('returns USER_NOT_FOUND when customer profile is missing', async () => {
    const userRepository = {
      findByIdentityId: vi.fn().mockResolvedValue(null),
    };
    const cartRepository = {
      findByCustomerId: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(),
    };

    const handler = new AddCartItemHandler(userRepository, cartRepository);
    const result = await handler.execute({
      identityId,
      productId: '44444444-4444-4444-4444-444444444444',
      quantity: 1,
      unitPriceAmount: 10,
      unitPriceCurrency: 'USD',
    });

    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('USER_NOT_FOUND');
  });
});
