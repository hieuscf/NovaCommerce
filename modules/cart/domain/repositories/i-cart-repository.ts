import type { Cart } from '../aggregates/cart';
import type { CartId } from '../value-objects/cart-id';

export interface ICartRepository {
  findById(id: CartId): Promise<Cart | null>;
  findByCustomerId(customerId: string): Promise<Cart | null>;
  save(cart: Cart): Promise<void>;
}
