import { describe, expect, it, vi } from 'vitest';
import { Order } from '../../domain/aggregates/order';
import { Money } from '../../domain/value-objects/money';
import { OrderId } from '../../domain/value-objects/order-id';
import { OrderNumber } from '../../domain/value-objects/order-number';
import { Quantity } from '../../domain/value-objects/quantity';
import { PrismaOrderRepository } from './prisma-order-repository';

describe('PrismaOrderRepository', () => {
  it('persists order and outbox events in a transaction', async () => {
    const outboxMessages: unknown[] = [];

    const tx = {
      order: {
        upsert: vi.fn(async ({ create }: { create: { id: string } }) => create),
      },
      orderLine: {
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
      order: { findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn() },
      $transaction: vi.fn(async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx)),
    };

    const outboxStore = { save: vi.fn() };
    const repository = new PrismaOrderRepository(prisma as never, outboxStore);

    const order = Order.createFromCheckout({
      id: OrderId.create('11111111-1111-1111-1111-111111111111'),
      orderNumber: OrderNumber.create('ORD-TEST001'),
      customerId: '22222222-2222-2222-2222-222222222222',
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

    await repository.save(order);

    expect(prisma.$transaction).toHaveBeenCalledOnce();
    expect(outboxMessages).toHaveLength(1);
    expect((outboxMessages[0] as { eventType: string }).eventType).toBe('OrderCreated');
  });

  it('persists cancellation outbox event in a transaction', async () => {
    const outboxMessages: unknown[] = [];

    const tx = {
      order: {
        upsert: vi.fn(async ({ create }: { create: { id: string } }) => create),
      },
      orderLine: {
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
      order: { findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn() },
      $transaction: vi.fn(async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx)),
    };

    const outboxStore = { save: vi.fn() };
    const repository = new PrismaOrderRepository(prisma as never, outboxStore);

    const order = Order.createFromCheckout({
      id: OrderId.create('11111111-1111-1111-1111-111111111111'),
      orderNumber: OrderNumber.create('ORD-TEST001'),
      customerId: '22222222-2222-2222-2222-222222222222',
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
    order.pullDomainEvents();
    order.cancel();

    await repository.save(order);

    expect(outboxMessages).toHaveLength(1);
    expect((outboxMessages[0] as { eventType: string }).eventType).toBe('OrderCancelled');
  });
});
