import type { PrismaClient } from '@prisma/client';
import { Promotion } from '../../domain/aggregates/promotion';
import { PromotionBenefit } from '../../domain/entities/promotion-benefit';
import { PromotionRule } from '../../domain/entities/promotion-rule';
import type { IPromotionRepository } from '../../domain/repositories/i-promotion-repository';
import { DateRange } from '../../domain/value-objects/date-range';

export class PrismaPromotionRepository implements IPromotionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Promotion | null> {
    const row = await this.prisma.promotion.findUnique({
      where: { id },
      include: { rules: true, benefits: true },
    });
    return row ? this.toDomain(row) : null;
  }

  async save(_promotion: Promotion): Promise<void> {
    throw new Error('PrismaPromotionRepository.save is not implemented for read-only checkout integration');
  }

  private toDomain(row: {
    id: string;
    name: string;
    validFrom: Date;
    validTo: Date;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    rules: Array<{ id: string; ruleType: string; config: unknown }>;
    benefits: Array<{ id: string; benefitType: string; value: unknown }>;
  }): Promotion {
    return Promotion.reconstitute({
      id: row.id,
      name: row.name,
      dateRange: DateRange.create(row.validFrom, row.validTo),
      active: row.active,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      rules: row.rules.map((rule) =>
        PromotionRule.create(rule.id, rule.ruleType, rule.config as Record<string, string>),
      ),
      benefits: row.benefits.map((benefit) =>
        PromotionBenefit.create(benefit.id, benefit.benefitType, Number(benefit.value)),
      ),
    });
  }
}
