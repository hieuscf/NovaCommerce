import { randomUUID } from 'node:crypto';
import type { DomainEvent, IOutboxStore, OutboxMessage } from '@novacommerce/building-blocks';
import type { Prisma, PrismaClient } from '@prisma/client';
import { Coupon } from '../../domain/aggregates/coupon';
import { CouponRedemption } from '../../domain/entities/coupon-redemption';
import type { ICouponRepository } from '../../domain/repositories/i-coupon-repository';
import { CouponCode } from '../../domain/value-objects/coupon-code';
import { DateRange } from '../../domain/value-objects/date-range';
import { PrismaOutboxStoreInTransaction } from '../prisma/prisma-outbox-store';

type CouponRow = Prisma.CouponGetPayload<{
  include: {
    redemptions: true;
  };
}>;

export class PrismaCouponRepository implements ICouponRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly outboxStore: IOutboxStore,
  ) {}

  async findByCode(code: CouponCode): Promise<Coupon | null> {
    const row = await this.prisma.coupon.findUnique({
      where: { code: code.value },
      include: { redemptions: true },
    });
    return row ? this.toDomain(row) : null;
  }

  async save(coupon: Coupon): Promise<void> {
    const events = coupon.pullDomainEvents();

    await this.prisma.$transaction(async (tx) => {
      await tx.coupon.update({
        where: { id: coupon.id },
        data: {
          updatedAt: coupon.updatedAt,
        },
      });

      await this.syncRedemptions(tx, coupon);

      if (events.length > 0) {
        const outboxStore = new PrismaOutboxStoreInTransaction(tx);
        await outboxStore.save(events.map((event) => this.toOutboxMessage(coupon.id, event)));
      }
    });
  }

  private async syncRedemptions(tx: Prisma.TransactionClient, coupon: Coupon): Promise<void> {
    const existing = await tx.couponRedemption.findMany({ where: { couponId: coupon.id } });
    const desiredIds = new Set(coupon.getRedemptions().map((redemption) => redemption.id));

    for (const redemption of coupon.getRedemptions()) {
      await tx.couponRedemption.upsert({
        where: { id: redemption.id },
        create: {
          id: redemption.id,
          couponId: coupon.id,
          orderId: redemption.getOrderId(),
          customerId: redemption.getCustomerId(),
          createdAt: redemption.createdAt,
          updatedAt: redemption.updatedAt,
        },
        update: {
          orderId: redemption.getOrderId(),
          customerId: redemption.getCustomerId(),
          updatedAt: redemption.updatedAt,
        },
      });
    }

    for (const row of existing) {
      if (!desiredIds.has(row.id)) {
        await tx.couponRedemption.delete({ where: { id: row.id } });
      }
    }
  }

  private toDomain(row: CouponRow): Coupon {
    return Coupon.reconstitute({
      id: row.id,
      code: CouponCode.create(row.code),
      promotionId: row.promotionId,
      dateRange: DateRange.create(row.validFrom, row.validTo),
      maxRedemptions: row.maxRedemptions,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      redemptions: row.redemptions.map((redemption) =>
        CouponRedemption.create(redemption.id, redemption.orderId, redemption.customerId),
      ),
    });
  }

  private toOutboxMessage(aggregateId: string, event: DomainEvent): OutboxMessage {
    return {
      id: randomUUID(),
      aggregateId,
      aggregateType: 'Coupon',
      eventType: event.eventName,
      payload: 'payload' in event ? (event as { payload: unknown }).payload : {},
      occurredOn: event.occurredOn,
    };
  }
}
