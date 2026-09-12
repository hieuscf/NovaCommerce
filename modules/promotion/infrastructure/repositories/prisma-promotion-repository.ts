import { randomUUID } from 'node:crypto';
import type { DomainEvent, IOutboxStore, OutboxMessage } from '@novacommerce/building-blocks';
import type { Prisma, PrismaClient } from '@prisma/client';
import { Promotion } from '../../domain/aggregates/promotion';
import { PromotionBenefit } from '../../domain/entities/promotion-benefit';
import { PromotionRule } from '../../domain/entities/promotion-rule';
import type { IPromotionRepository } from '../../domain/repositories/i-promotion-repository';
import { DateRange } from '../../domain/value-objects/date-range';
import { PrismaOutboxStoreInTransaction } from '../prisma/prisma-outbox-store';

type PromotionRow = Prisma.PromotionGetPayload<{
  include: {
    rules: true;
    benefits: true;
  };
}>;

export class PrismaPromotionRepository implements IPromotionRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly outboxStore: IOutboxStore,
  ) {}

  async findById(id: string): Promise<Promotion | null> {
    const row = await this.prisma.promotion.findUnique({
      where: { id },
      include: { rules: true, benefits: true },
    });
    return row ? this.toDomain(row) : null;
  }

  async save(promotion: Promotion): Promise<void> {
    const events = promotion.pullDomainEvents();
    const dateRange = promotion.getDateRange();

    await this.prisma.$transaction(async (tx) => {
      await tx.promotion.upsert({
        where: { id: promotion.id },
        create: {
          id: promotion.id,
          name: promotion.getName(),
          validFrom: dateRange.start,
          validTo: dateRange.end,
          active: promotion.isActive(),
          createdAt: promotion.createdAt,
          updatedAt: promotion.updatedAt,
        },
        update: {
          name: promotion.getName(),
          validFrom: dateRange.start,
          validTo: dateRange.end,
          active: promotion.isActive(),
          updatedAt: promotion.updatedAt,
        },
      });

      if (events.length > 0) {
        const outboxStore = new PrismaOutboxStoreInTransaction(tx);
        await outboxStore.save(events.map((event) => this.toOutboxMessage(promotion.id, event)));
      }
    });
  }

  private toDomain(row: PromotionRow): Promotion {
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

  private toOutboxMessage(aggregateId: string, event: DomainEvent): OutboxMessage {
    return {
      id: randomUUID(),
      aggregateId,
      aggregateType: 'Promotion',
      eventType: event.eventName,
      payload: 'payload' in event ? (event as { payload: unknown }).payload : {},
      occurredOn: event.occurredOn,
    };
  }
}
