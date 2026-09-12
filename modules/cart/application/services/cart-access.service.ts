import { randomUUID } from 'node:crypto';
import { Cart } from '../../domain/aggregates/cart';
import type { ICartRepository } from '../../domain/repositories/i-cart-repository';
import { CartId } from '../../domain/value-objects/cart-id';

export async function getOrCreateCartForCustomer(
  cartRepository: ICartRepository,
  customerId: string,
): Promise<Cart> {
  const existing = await cartRepository.findByCustomerId(customerId);
  if (existing) {
    return existing;
  }

  const cart = Cart.create(CartId.create(randomUUID()), customerId).getValue();
  await cartRepository.save(cart);
  return cart;
}
