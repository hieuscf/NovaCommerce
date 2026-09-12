import { describe, expect, it, vi } from 'vitest';
import { Cart } from '../../domain/aggregates/cart';
import { CartItem } from '../../domain/entities/cart-item';
import { CartId } from '../../domain/value-objects/cart-id';
import { Money } from '../../domain/value-objects/money';
import { ProductReference } from '../../domain/value-objects/product-reference';
import { Quantity } from '../../domain/value-objects/quantity';
import { PrismaCartRepository } from './prisma-cart-repository';

describe('PrismaCartRepository', () => {
  it('persists cart items and outbox events in a transaction', async () => {
    const outboxMessages: unknown[] = [];

    const tx = {
      cart: {
        upsert: vi.fn(),
      },
      cartItem: {
        findMany: vi.fn().mockResolvedValue([]),
        upsert: vi.fn(),
        delete: vi.fn(),
      },
      outboxMessage: {
        createMany: vi.fn(async ({ data }: { data: unknown[] }) => {
          outboxMessages.push(...data);
        }),
      },
    };

    const prisma = {
      cart: { findUnique: vi.fn(), findFirst: vi.fn() },
      $transaction: vi.fn(async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx)),
    };

    const outboxStore = { save: vi.fn() };
    const repository = new PrismaCartRepository(prisma as never, outboxStore);

    const cart = Cart.create(CartId.create('11111111-1111-1111-1111-111111111111'), 'customer-1').getValue();
    cart.addItem(
      CartItem.create(
        '22222222-2222-2222-2222-222222222222',
        ProductReference.create('33333333-3333-3333-3333-333333333333'),
        Quantity.create(2),
        Money.create(19.99, 'USD'),
      ),
    );

    await repository.save(cart);

    expect(prisma.$transaction).toHaveBeenCalledOnce();
    expect(outboxMessages.length).toBeGreaterThan(0);
    expect((outboxMessages[0] as { eventType: string }).eventType).toBe('CartCreated');
  });
});
