import { describe, expect, it, vi } from 'vitest';
import { Product } from '../../domain/aggregates/product';
import { Money } from '../../domain/value-objects/money';
import { ProductName } from '../../domain/value-objects/product-name';
import { ProductSlug } from '../../domain/value-objects/product-slug';
import { PrismaProductRepository } from './prisma-product-repository';

describe('PrismaProductRepository', () => {
  it('persists product and outbox events in a transaction', async () => {
    const outboxMessages: unknown[] = [];

    const tx = {
      product: {
        upsert: vi.fn(async ({ create }: { create: { id: string } }) => create),
      },
      productVariant: {
        findMany: vi.fn().mockResolvedValue([]),
        upsert: vi.fn(),
        delete: vi.fn(),
      },
      productImage: {
        findMany: vi.fn().mockResolvedValue([]),
        upsert: vi.fn(),
        delete: vi.fn(),
      },
      productAttribute: {
        findMany: vi.fn().mockResolvedValue([]),
        upsert: vi.fn(),
        delete: vi.fn(),
      },
      productOption: {
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
      product: { findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn() },
      $transaction: vi.fn(async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx)),
    };

    const outboxStore = { save: vi.fn() };
    const repository = new PrismaProductRepository(prisma as never, outboxStore);

    const product = Product.create(
      '11111111-1111-1111-1111-111111111111',
      ProductName.create('Nova Headphones'),
      ProductSlug.create('nova-headphones'),
      Money.create(99.99, 'USD'),
    ).getValue();

    await repository.save(product);

    expect(prisma.$transaction).toHaveBeenCalledOnce();
    expect(outboxMessages).toHaveLength(1);
    expect((outboxMessages[0] as { eventType: string }).eventType).toBe('ProductCreated');
  });
});
