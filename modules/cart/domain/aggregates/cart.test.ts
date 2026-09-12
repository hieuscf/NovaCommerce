import { describe, expect, it } from 'vitest';
import { CartItem } from '../entities/cart-item';
import { CartClearedEvent } from '../events/cart-cleared.event';
import { CartCreatedEvent } from '../events/cart-created.event';
import { CartItemAddedEvent } from '../events/cart-item-added.event';
import { CartItemRemovedEvent } from '../events/cart-item-removed.event';
import { CartId } from '../value-objects/cart-id';
import { Money } from '../value-objects/money';
import { ProductReference } from '../value-objects/product-reference';
import { Quantity } from '../value-objects/quantity';
import { Cart } from './cart';

describe('Cart aggregate', () => {
  const cartId = CartId.create('11111111-1111-1111-1111-111111111111');
  const customerId = '22222222-2222-2222-2222-222222222222';
  const productRef = ProductReference.create('33333333-3333-3333-3333-333333333333');
  const unitPrice = Money.create(19.99, 'USD');

  function createItem(id: string, quantity = 2) {
    return CartItem.create(id, productRef, Quantity.create(quantity), unitPrice);
  }

  it('creates cart with CartCreated event', () => {
    const result = Cart.create(cartId, customerId);
    expect(result.isSuccess).toBe(true);

    const cart = result.getValue();
    expect(cart.getCustomerId()).toBe(customerId);
    expect(cart.getItems()).toHaveLength(0);

    const events = cart.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(CartCreatedEvent);
  });

  it('adds item and emits CartItemAdded', () => {
    const cart = Cart.create(cartId, customerId).getValue();
    const addResult = cart.addItem(createItem('item-1'));
    expect(addResult.isSuccess).toBe(true);
    expect(cart.getItems()).toHaveLength(1);

    const events = cart.pullDomainEvents();
    expect(events.some((event) => event instanceof CartItemAddedEvent)).toBe(true);
  });

  it('merges quantity when adding the same product reference', () => {
    const cart = Cart.create(cartId, customerId).getValue();
    cart.addItem(createItem('item-1', 2));
    cart.addItem(createItem('item-2', 3));

    expect(cart.getItems()).toHaveLength(1);
    expect(cart.getItems()[0]?.getQuantity().value).toBe(5);
  });

  it('updates item quantity', () => {
    const cart = Cart.create(cartId, customerId).getValue();
    cart.addItem(createItem('item-1', 2));

    const result = cart.updateItemQuantity('item-1', Quantity.create(4));
    expect(result.isSuccess).toBe(true);
    expect(cart.getItems()[0]?.getQuantity().value).toBe(4);
  });

  it('fails to update missing item', () => {
    const cart = Cart.create(cartId, customerId).getValue();
    const result = cart.updateItemQuantity('missing', Quantity.create(1));
    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('CART_ITEM_NOT_FOUND');
  });

  it('removes item and emits CartItemRemoved', () => {
    const cart = Cart.create(cartId, customerId).getValue();
    cart.addItem(createItem('item-1'));

    const result = cart.removeItem('item-1');
    expect(result.isSuccess).toBe(true);
    expect(cart.getItems()).toHaveLength(0);

    const events = cart.pullDomainEvents();
    expect(events.some((event) => event instanceof CartItemRemovedEvent)).toBe(true);
  });

  it('clears cart and emits CartCleared', () => {
    const cart = Cart.create(cartId, customerId).getValue();
    cart.addItem(createItem('item-1'));

    const result = cart.clear();
    expect(result.isSuccess).toBe(true);
    expect(cart.getItems()).toHaveLength(0);

    const events = cart.pullDomainEvents();
    expect(events.some((event) => event instanceof CartClearedEvent)).toBe(true);
  });
});
