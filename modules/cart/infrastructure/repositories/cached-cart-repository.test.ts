import { describe, expect, it, vi } from 'vitest';
import { Cart } from '../../domain/aggregates/cart';
import { CartId } from '../../domain/value-objects/cart-id';
import { CachedCartRepository } from './cached-cart-repository';

describe('CachedCartRepository', () => {
  it('caches cart by customer id and invalidates on save', async () => {
    const cart = Cart.create(CartId.create('11111111-1111-1111-1111-111111111111'), 'customer-1').getValue();
    cart.pullDomainEvents();

    const cacheStore = new Map<string, unknown>();
    const cache = {
      get: vi.fn(async <T>(key: string) => (cacheStore.get(key) as T | undefined) ?? null),
      set: vi.fn(async (key: string, value: unknown) => {
        cacheStore.set(key, value);
      }),
      delete: vi.fn(async (key: string) => {
        cacheStore.delete(key);
      }),
      exists: vi.fn(),
      ping: vi.fn(),
    };

    const delegate = {
      findById: vi.fn(),
      findByCustomerId: vi.fn().mockResolvedValue(cart),
      save: vi.fn().mockResolvedValue(undefined),
    };

    const repository = new CachedCartRepository(delegate, cache);

    const first = await repository.findByCustomerId('customer-1');
    const second = await repository.findByCustomerId('customer-1');

    expect(first?.id).toBe(cart.id);
    expect(second?.id).toBe(cart.id);
    expect(delegate.findByCustomerId).toHaveBeenCalledOnce();

    await repository.save(cart);
    expect(cache.delete).toHaveBeenCalled();
  });
});
