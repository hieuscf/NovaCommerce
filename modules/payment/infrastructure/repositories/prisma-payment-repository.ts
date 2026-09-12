import { randomUUID } from 'node:crypto';
import type { DomainEvent, IOutboxStore, OutboxMessage } from '@novacommerce/building-blocks';
import type { Prisma, PrismaClient } from '@prisma/client';
import { Payment, PaymentStatus } from '../../domain/aggregates/payment';
import { PaymentAttempt, PaymentAttemptStatus } from '../../domain/entities/payment-attempt';
import { PaymentTransaction } from '../../domain/entities/payment-transaction';
import type { IPaymentRepository } from '../../domain/repositories/i-payment-repository';
import { Money } from '../../domain/value-objects/money';
import { PaymentMethod } from '../../domain/value-objects/payment-method';
import { PaymentReference } from '../../domain/value-objects/payment-reference';
import { ProviderReference } from '../../domain/value-objects/provider-reference';
import { PrismaOutboxStoreInTransaction } from '../prisma/prisma-outbox-store';

type PaymentRow = Prisma.PaymentGetPayload<{
  include: {
    attempts: true;
    transactions: true;
  };
}>;

export class PrismaPaymentRepository implements IPaymentRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly outboxStore: IOutboxStore,
  ) {}

  async findById(id: string): Promise<Payment | null> {
    const row = await this.prisma.payment.findUnique({
      where: { id },
      include: this.defaultInclude(),
    });
    return row ? this.toDomain(row) : null;
  }

  async findByReference(reference: PaymentReference): Promise<Payment | null> {
    const row = await this.prisma.payment.findUnique({
      where: { reference: reference.value },
      include: this.defaultInclude(),
    });
    return row ? this.toDomain(row) : null;
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    const row = await this.prisma.payment.findFirst({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
      include: this.defaultInclude(),
    });
    return row ? this.toDomain(row) : null;
  }

  async save(payment: Payment): Promise<void> {
    const events = payment.pullDomainEvents();

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.upsert({
        where: { id: payment.id },
        create: {
          id: payment.id,
          reference: payment.getReference().value,
          orderId: payment.getOrderId(),
          amount: payment.getAmount().amount,
          currency: payment.getAmount().currency,
          method: payment.getMethod().value,
          status: payment.getStatus(),
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
        },
        update: {
          reference: payment.getReference().value,
          orderId: payment.getOrderId(),
          amount: payment.getAmount().amount,
          currency: payment.getAmount().currency,
          method: payment.getMethod().value,
          status: payment.getStatus(),
          updatedAt: payment.updatedAt,
        },
      });

      await this.syncAttempts(tx, payment);
      await this.syncTransactions(tx, payment);

      if (events.length > 0) {
        const outboxStore = new PrismaOutboxStoreInTransaction(tx);
        await outboxStore.save(events.map((event) => this.toOutboxMessage(payment.id, event)));
      }
    });
  }

  private async syncAttempts(tx: Prisma.TransactionClient, payment: Payment): Promise<void> {
    const existing = await tx.paymentAttempt.findMany({ where: { paymentId: payment.id } });
    const desiredIds = new Set(payment.getAttempts().map((attempt) => attempt.id));

    for (const attempt of payment.getAttempts()) {
      await tx.paymentAttempt.upsert({
        where: { id: attempt.id },
        create: {
          id: attempt.id,
          paymentId: payment.id,
          status: attempt.getStatus(),
          failureReason: attempt.getFailureReason() ?? null,
          createdAt: attempt.createdAt,
          updatedAt: attempt.updatedAt,
        },
        update: {
          status: attempt.getStatus(),
          failureReason: attempt.getFailureReason() ?? null,
          updatedAt: attempt.updatedAt,
        },
      });
    }

    for (const row of existing) {
      if (!desiredIds.has(row.id)) {
        await tx.paymentAttempt.delete({ where: { id: row.id } });
      }
    }
  }

  private async syncTransactions(tx: Prisma.TransactionClient, payment: Payment): Promise<void> {
    const existing = await tx.paymentTransaction.findMany({ where: { paymentId: payment.id } });
    const desiredIds = new Set(payment.getTransactions().map((transaction) => transaction.id));

    for (const transaction of payment.getTransactions()) {
      await tx.paymentTransaction.upsert({
        where: { id: transaction.id },
        create: {
          id: transaction.id,
          paymentId: payment.id,
          amount: transaction.getAmount().amount,
          currency: transaction.getAmount().currency,
          providerReference: transaction.getProviderReference().value,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
        },
        update: {
          amount: transaction.getAmount().amount,
          currency: transaction.getAmount().currency,
          providerReference: transaction.getProviderReference().value,
          updatedAt: transaction.updatedAt,
        },
      });
    }

    for (const row of existing) {
      if (!desiredIds.has(row.id)) {
        await tx.paymentTransaction.delete({ where: { id: row.id } });
      }
    }
  }

  private defaultInclude() {
    return {
      attempts: true,
      transactions: true,
    } as const;
  }

  private toDomain(row: PaymentRow): Payment {
    return Payment.reconstitute({
      id: row.id,
      reference: PaymentReference.create(row.reference),
      orderId: row.orderId,
      amount: Money.create(Number(row.amount), row.currency),
      method: PaymentMethod.create(row.method),
      status: row.status as PaymentStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      attempts: row.attempts.map((attempt) =>
        PaymentAttempt.reconstitute({
          id: attempt.id,
          status: attempt.status as PaymentAttemptStatus,
          failureReason: attempt.failureReason ?? undefined,
          createdAt: attempt.createdAt,
          updatedAt: attempt.updatedAt,
        }),
      ),
      transactions: row.transactions.map((transaction) =>
        PaymentTransaction.reconstitute({
          id: transaction.id,
          amount: Money.create(Number(transaction.amount), transaction.currency),
          providerReference: ProviderReference.create(transaction.providerReference),
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
        }),
      ),
    });
  }

  private toOutboxMessage(aggregateId: string, event: DomainEvent): OutboxMessage {
    return {
      id: randomUUID(),
      aggregateId,
      aggregateType: 'Payment',
      eventType: event.eventName,
      payload: 'payload' in event ? (event as { payload: unknown }).payload : {},
      occurredOn: event.occurredOn,
    };
  }
}
