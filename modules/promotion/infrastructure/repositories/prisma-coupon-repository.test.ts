import { describe, expect, it, vi } from 'vitest';
import { Coupon } from '../../domain/aggregates/coupon';
import { CouponCode } from '../../domain/value-objects/coupon-code';
import { DateRange } from '../../domain/value-objects/date-range';
import { PrismaCouponRepository } from './prisma-coupon-repository';

describe('PrismaCouponRepository', () => {
  it('persists coupon redemptions and outbox events in a transaction', async () => {
    const outboxMessages: unknown[] = [];

    const tx = {
      coupon: {
        update: vi.fn(),
      },
      couponRedemption: {
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
      coupon: { findUnique: vi.fn() },
      $transaction: vi.fn(async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx)),
    };

    const outboxStore = { save: vi.fn() };
    const repository = new PrismaCouponRepository(prisma as never, outboxStore);

    const coupon = Coupon.create(
      '11111111-1111-1111-1111-111111111111',
      CouponCode.create('SAVE10'),
      '22222222-2222-2222-2222-222222222222',
      DateRange.create(new Date('2026-01-01T00:00:00.000Z'), new Date('2026-12-31T23:59:59.999Z')),
      2,
    ).getValue();

    coupon.use(
      '33333333-3333-3333-3333-333333333333',
      '44444444-4444-4444-4444-444444444444',
      '55555555-5555-5555-5555-555555555555',
    );

    await repository.save(coupon);

    expect(prisma.$transaction).toHaveBeenCalledOnce();
    expect(outboxMessages).toHaveLength(1);
    expect((outboxMessages[0] as { eventType: string }).eventType).toBe('CouponUsed');
  });
});
