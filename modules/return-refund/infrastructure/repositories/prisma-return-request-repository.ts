import { randomUUID } from 'node:crypto';
import type { DomainEvent, IOutboxStore, OutboxMessage } from '@novacommerce/building-blocks';
import type { PrismaClient } from '@prisma/client';
import { ReturnRequest } from '../../domain/aggregates/return-request';
import type { IReturnRequestRepository } from '../../domain/repositories/i-return-request-repository';
import { Money } from '../../domain/value-objects/money';
import { RETURN_REQUEST_STATUSES, ReturnStatus } from '../../domain/value-objects/return-status';
import { PrismaOutboxStoreInTransaction } from '../prisma/prisma-outbox-store';

export class PrismaReturnRequestRepository implements IReturnRequestRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly outboxStore: IOutboxStore,
  ) {}

  async findById(id: string): Promise<ReturnRequest | null> {
    const row = await this.prisma.returnRequest.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findActiveByOrderId(orderId: string): Promise<ReturnRequest | null> {
    const row = await this.prisma.returnRequest.findFirst({
      where: {
        orderId,
        status: {
          in: [RETURN_REQUEST_STATUSES.REQUESTED, RETURN_REQUEST_STATUSES.APPROVED],
        },
      },
    });
    return row ? this.toDomain(row) : null;
  }

  async save(returnRequest: ReturnRequest): Promise<void> {
    const events = returnRequest.pullDomainEvents();
    const refundAmount = returnRequest.getRefundAmount();

    await this.prisma.$transaction(async (tx) => {
      await tx.returnRequest.upsert({
        where: { id: returnRequest.id },
        create: {
          id: returnRequest.id,
          orderId: returnRequest.getOrderId(),
          customerId: returnRequest.getCustomerId(),
          paymentId: returnRequest.getPaymentId(),
          status: returnRequest.getStatus().value,
          refundAmount: refundAmount.amount,
          currency: refundAmount.currency,
          createdAt: returnRequest.createdAt,
          updatedAt: returnRequest.updatedAt,
        },
        update: {
          status: returnRequest.getStatus().value,
          refundAmount: refundAmount.amount,
          currency: refundAmount.currency,
          updatedAt: returnRequest.updatedAt,
        },
      });

      if (events.length > 0) {
        const outboxStore = new PrismaOutboxStoreInTransaction(tx);
        await outboxStore.save(events.map((event) => this.toOutboxMessage(returnRequest.id, event)));
      }
    });
  }

  private toDomain(row: {
    id: string;
    orderId: string;
    customerId: string;
    paymentId: string;
    status: string;
    refundAmount: unknown;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
  }): ReturnRequest {
    return ReturnRequest.reconstitute({
      id: row.id,
      orderId: row.orderId,
      customerId: row.customerId,
      paymentId: row.paymentId,
      refundAmount: Money.create(Number(row.refundAmount), row.currency),
      status: ReturnStatus.create(row.status),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private toOutboxMessage(aggregateId: string, event: DomainEvent): OutboxMessage {
    return {
      id: randomUUID(),
      aggregateId,
      aggregateType: 'ReturnRequest',
      eventType: event.eventName,
      payload: 'payload' in event ? (event as { payload: unknown }).payload : {},
      occurredOn: event.occurredOn,
    };
  }
}
