import type { PrismaClient } from '@prisma/client';
import { Coupon } from '../../domain/aggregates/coupon';
import type { ICouponRepository } from '../../domain/repositories/i-coupon-repository';
import { CouponCode } from '../../domain/value-objects/coupon-code';
import { DateRange } from '../../domain/value-objects/date-range';
export class PrismaCouponRepository implements ICouponRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByCode(code: CouponCode): Promise<Coupon | null> {
    const row = await this.prisma.coupon.findUnique({
      where: { code: code.value },
      include: { redemptions: true },
    });
    return row ? this.toDomain(row) : null;
  }

  async save(_coupon: Coupon): Promise<void> {
    throw new Error('PrismaCouponRepository.save is not implemented for read-only checkout integration');
  }

  private toDomain(row: {
    id: string;
    code: string;
    promotionId: string;
    validFrom: Date;
    validTo: Date;
    maxRedemptions: number;
    createdAt: Date;
    updatedAt: Date;
    redemptions: Array<{
      id: string;
      orderId: string;
      customerId: string;
      createdAt: Date;
      updatedAt: Date;
    }>;
  }): Coupon {
    return Coupon.reconstitute({
      id: row.id,
      code: CouponCode.create(row.code),
      promotionId: row.promotionId,
      dateRange: DateRange.create(row.validFrom, row.validTo),
      maxRedemptions: row.maxRedemptions,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      redemptions: [],
    });
  }
}
