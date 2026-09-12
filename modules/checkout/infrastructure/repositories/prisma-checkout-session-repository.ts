import { randomUUID } from 'node:crypto';
import type { DomainEvent, IOutboxStore, OutboxMessage } from '@novacommerce/building-blocks';
import type { Prisma, PrismaClient } from '@prisma/client';
import { CheckoutSession, CheckoutStatus } from '../../domain/aggregates/checkout-session';
import { CheckoutAdjustment, CheckoutAdjustmentType } from '../../domain/entities/checkout-adjustment';
import { CheckoutLine } from '../../domain/entities/checkout-line';
import type { ICheckoutSessionRepository } from '../../domain/repositories/i-checkout-session-repository';
import { PrismaOutboxStoreInTransaction } from '../prisma/prisma-outbox-store';

type CheckoutSessionRow = Prisma.CheckoutSessionGetPayload<{
  include: { lines: true; adjustments: true };
}>;

export class PrismaCheckoutSessionRepository implements ICheckoutSessionRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly outboxStore: IOutboxStore,
  ) {}

  async findById(id: string): Promise<CheckoutSession | null> {
    const row = await this.prisma.checkoutSession.findUnique({
      where: { id },
      include: this.defaultInclude(),
    });
    return row ? this.toDomain(row) : null;
  }

  async save(session: CheckoutSession): Promise<void> {
    const events = session.pullDomainEvents();

    await this.prisma.$transaction(async (tx) => {
      await tx.checkoutSession.upsert({
        where: { id: session.id },
        create: {
          id: session.id,
          cartId: session.getCartId(),
          customerId: session.getCustomerId(),
          status: session.getStatus(),
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
        },
        update: {
          customerId: session.getCustomerId(),
          status: session.getStatus(),
          updatedAt: session.updatedAt,
        },
      });

      await this.syncLines(tx, session);
      await this.syncAdjustments(tx, session);

      if (events.length > 0) {
        const outboxStore = new PrismaOutboxStoreInTransaction(tx);
        await outboxStore.save(events.map((event) => this.toOutboxMessage(session.id, event)));
      }
    });
  }

  private async syncLines(tx: Prisma.TransactionClient, session: CheckoutSession): Promise<void> {
    const existing = await tx.checkoutLine.findMany({ where: { checkoutSessionId: session.id } });
    const desiredIds = new Set(session.getLines().map((line) => line.id));

    for (const line of session.getLines()) {
      await tx.checkoutLine.upsert({
        where: { id: line.id },
        create: {
          id: line.id,
          checkoutSessionId: session.id,
          productId: line.getProductId(),
          variantId: line.getVariantId() ?? null,
          quantity: line.getQuantity(),
          unitPriceAmount: line.getUnitPriceAmount(),
          currency: line.getCurrency(),
          createdAt: line.createdAt,
          updatedAt: line.updatedAt,
        },
        update: {
          productId: line.getProductId(),
          variantId: line.getVariantId() ?? null,
          quantity: line.getQuantity(),
          unitPriceAmount: line.getUnitPriceAmount(),
          currency: line.getCurrency(),
          updatedAt: line.updatedAt,
        },
      });
    }

    for (const row of existing) {
      if (!desiredIds.has(row.id)) {
        await tx.checkoutLine.delete({ where: { id: row.id } });
      }
    }
  }

  private async syncAdjustments(tx: Prisma.TransactionClient, session: CheckoutSession): Promise<void> {
    const existing = await tx.checkoutAdjustment.findMany({ where: { checkoutSessionId: session.id } });
    const desiredIds = new Set(session.getAdjustments().map((adjustment) => adjustment.id));

    for (const adjustment of session.getAdjustments()) {
      await tx.checkoutAdjustment.upsert({
        where: { id: adjustment.id },
        create: {
          id: adjustment.id,
          checkoutSessionId: session.id,
          type: adjustment.getType(),
          label: adjustment.getLabel(),
          amount: adjustment.getAmount(),
          currency: adjustment.getCurrency(),
          createdAt: adjustment.createdAt,
          updatedAt: adjustment.updatedAt,
        },
        update: {
          type: adjustment.getType(),
          label: adjustment.getLabel(),
          amount: adjustment.getAmount(),
          currency: adjustment.getCurrency(),
          updatedAt: adjustment.updatedAt,
        },
      });
    }

    for (const row of existing) {
      if (!desiredIds.has(row.id)) {
        await tx.checkoutAdjustment.delete({ where: { id: row.id } });
      }
    }
  }

  private defaultInclude() {
    return { lines: true, adjustments: true } as const;
  }

  private toDomain(row: CheckoutSessionRow): CheckoutSession {
    return CheckoutSession.reconstitute({
      id: row.id,
      cartId: row.cartId,
      customerId: row.customerId ?? undefined,
      status: row.status as CheckoutStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      lines: row.lines.map((line) =>
        CheckoutLine.create(
          line.id,
          line.productId,
          line.quantity,
          Number(line.unitPriceAmount),
          line.currency,
          line.variantId ?? undefined,
        ),
      ),
      adjustments: row.adjustments.map((adjustment) =>
        CheckoutAdjustment.create(
          adjustment.id,
          adjustment.type as CheckoutAdjustmentType,
          adjustment.label,
          Number(adjustment.amount),
          adjustment.currency,
        ),
      ),
    });
  }

  private toOutboxMessage(aggregateId: string, event: DomainEvent): OutboxMessage {
    return {
      id: randomUUID(),
      aggregateId,
      aggregateType: 'CheckoutSession',
      eventType: event.eventName,
      payload: 'payload' in event ? (event as { payload: unknown }).payload : {},
      occurredOn: event.occurredOn,
    };
  }
}
