import { describe, expect, it, vi } from 'vitest';
import { InventoryItem } from '../../domain/aggregates/inventory-item';
import { Quantity } from '../../domain/value-objects/quantity';
import { ReservationId } from '../../domain/value-objects/reservation-id';
import { Sku } from '../../domain/value-objects/sku';
import { WarehouseId } from '../../domain/value-objects/warehouse-id';
import { PrismaInventoryItemRepository } from './prisma-inventory-item-repository';

describe('PrismaInventoryItemRepository', () => {
  it('persists inventory item and outbox events in a transaction', async () => {
    const outboxMessages: unknown[] = [];

    const tx = {
      inventoryItem: {
        upsert: vi.fn(async ({ create }: { create: { id: string } }) => create),
      },
      stockReservation: {
        findMany: vi.fn().mockResolvedValue([]),
        upsert: vi.fn(),
        delete: vi.fn(),
      },
      stockAdjustment: {
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
      inventoryItem: { findUnique: vi.fn(), findMany: vi.fn() },
      $transaction: vi.fn(async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx)),
    };

    const outboxStore = { save: vi.fn() };
    const repository = new PrismaInventoryItemRepository(prisma as never, outboxStore);

    const item = InventoryItem.create(
      '11111111-1111-1111-1111-111111111111',
      Sku.create('NOVA-HP-001'),
      WarehouseId.create('22222222-2222-2222-2222-222222222222'),
      Quantity.create(10),
    ).getValue();

    item.reserve(
      'res-1',
      ReservationId.create('33333333-3333-3333-3333-333333333333'),
      '44444444-4444-4444-4444-444444444444',
      Quantity.create(2),
    );

    await repository.save(item);

    expect(prisma.$transaction).toHaveBeenCalledOnce();
    expect(outboxMessages).toHaveLength(1);
    expect((outboxMessages[0] as { eventType: string }).eventType).toBe('StockReserved');
  });
});
