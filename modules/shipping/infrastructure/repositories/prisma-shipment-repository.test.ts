import { describe, expect, it, vi } from 'vitest';
import { ShipmentItem } from '../../domain/entities/shipment-item';
import { Address } from '../../domain/value-objects/address';
import { CarrierCode } from '../../domain/value-objects/carrier-code';
import { Shipment } from '../../domain/aggregates/shipment';
import { PrismaShipmentRepository } from './prisma-shipment-repository';

describe('PrismaShipmentRepository', () => {
  it('persists shipment and outbox events in a transaction', async () => {
    const outboxMessages: unknown[] = [];

    const tx = {
      shipment: {
        upsert: vi.fn(async ({ create }: { create: { id: string } }) => create),
      },
      shipmentItem: {
        findMany: vi.fn().mockResolvedValue([]),
        upsert: vi.fn(),
        delete: vi.fn(),
      },
      trackingRecord: {
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
      shipment: { findUnique: vi.fn(), findFirst: vi.fn() },
      $transaction: vi.fn(async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx)),
    };

    const outboxStore = { save: vi.fn() };
    const repository = new PrismaShipmentRepository(prisma as never, outboxStore);

    const shipment = Shipment.create(
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
      CarrierCode.create('standard'),
      Address.create({
        line1: '123 Main St',
        city: 'Austin',
        state: 'TX',
        postalCode: '78701',
        country: 'US',
      }),
    ).getValue();

    shipment.addItem(ShipmentItem.create('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 1));

    await repository.save(shipment);

    expect(prisma.$transaction).toHaveBeenCalledOnce();
    expect(outboxMessages).toHaveLength(1);
    expect((outboxMessages[0] as { eventType: string }).eventType).toBe('ShipmentCreated');
  });
});
