import { AggregateRoot, Result } from '@novacommerce/building-blocks';
import { CartDomainError } from '../errors/cart-domain.error';
import { CartItem } from '../entities/cart-item';
import { CartClearedEvent } from '../events/cart-cleared.event';
import { CartCreatedEvent } from '../events/cart-created.event';
import { CartItemAddedEvent } from '../events/cart-item-added.event';
import { CartItemRemovedEvent } from '../events/cart-item-removed.event';
import type { CartId } from '../value-objects/cart-id';
import type { Money } from '../value-objects/money';
import type { ProductReference } from '../value-objects/product-reference';
import type { Quantity } from '../value-objects/quantity';

export class Cart extends AggregateRoot<string> {
  private items: CartItem[] = [];

  private constructor(id: string, createdAt: Date, updatedAt: Date, private customerId?: string) {
    super(id, createdAt, updatedAt);
  }

  static create(id: CartId, customerId?: string): Result<Cart, CartDomainError> {
    const now = new Date();
    const cart = new Cart(id.value, now, now, customerId);
    cart.addDomainEvent(new CartCreatedEvent(id.value, now, {}));
    return Result.ok(cart);
  }

  static reconstitute(props: { id: string; customerId?: string; createdAt: Date; updatedAt: Date; items: CartItem[] }): Cart {
    const cart = new Cart(props.id, props.createdAt, props.updatedAt, props.customerId);
    cart.items = [...props.items];
    return cart;
  }

  addItem(item: CartItem): Result<void, CartDomainError> {
    const existing = this.items.find((i) => i.getProductReference().equals(item.getProductReference()));
    if (existing) {
      existing.updateQuantity(item.getQuantity());
    } else {
      this.items.push(item);
    }
    this.updatedAt = new Date();
    this.addDomainEvent(new CartItemAddedEvent(this.id, new Date(), {
      productId: item.getProductReference().productId,
      quantity: item.getQuantity().value,
    }));
    return Result.ok(undefined);
  }

  removeItem(itemId: string): Result<void, CartDomainError> {
    const index = this.items.findIndex((i) => i.id === itemId);
    if (index === -1) {
      return Result.fail(new CartDomainError('Cart item not found', 'CART_ITEM_NOT_FOUND'));
    }
    this.items.splice(index, 1);
    this.updatedAt = new Date();
    this.addDomainEvent(new CartItemRemovedEvent(this.id, new Date(), { itemId }));
    return Result.ok(undefined);
  }

  clear(): Result<void, CartDomainError> {
    this.items = [];
    this.updatedAt = new Date();
    this.addDomainEvent(new CartClearedEvent(this.id, new Date(), {}));
    return Result.ok(undefined);
  }

  getItems(): readonly CartItem[] { return this.items; }
  getCustomerId(): string | undefined { return this.customerId; }
}
