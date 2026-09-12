import { randomUUID } from 'node:crypto';
import type { DomainEvent, IOutboxStore, OutboxMessage } from '@novacommerce/building-blocks';
import type { Prisma, PrismaClient } from '@prisma/client';
import { Order, OrderStatus } from '../../domain/aggregates/order';
import { OrderLine } from '../../domain/entities/order-line';
import type { IOrderRepository } from '../../domain/repositories/i-order-repository';
import { Money } from '../../domain/value-objects/money';
import { OrderId } from '../../domain/value-objects/order-id';
import { OrderNumber } from '../../domain/value-objects/order-number';
import { Quantity } from '../../domain/value-objects/quantity';
import { PrismaOutboxStoreInTransaction } from '../prisma/prisma-outbox-store';

type OrderRow = Prisma.OrderGetPayload<{ include: { lines: true } }>;

export class PrismaOrderRepository implements IOrderRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly outboxStore: IOutboxStore,
  ) {}

  async findById(id: OrderId): Promise<Order | null> {
    const row = await this.prisma.order.findUnique({
      where: { id: id.value },
      include: this.defaultInclude(),
    });
    return row ? this.toDomain(row) : null;
  }

  async findByOrderNumber(orderNumber: OrderNumber): Promise<Order | null> {
    const row = await this.prisma.order.findUnique({
      where: { orderNumber: orderNumber.value },
      include: this.defaultInclude(),
    });
    return row ? this.toDomain(row) : null;
  }

  async save(order: Order): Promise<void> {
    const events = order.pullDomainEvents();

    await this.prisma.$transaction(async (tx) => {
      await tx.order.upsert({
        where: { id: order.id },
        create: {
          id: order.id,
          orderNumber: order.getOrderNumber().value,
          customerId: order.getCustomerId(),
          status: order.getStatus(),
          totalAmount: order.getTotal().amount,
          totalCurrency: order.getTotal().currency,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },
        update: {
          status: order.getStatus(),
          totalAmount: order.getTotal().amount,
          totalCurrency: order.getTotal().currency,
          updatedAt: order.updatedAt,
        },
      });

      await this.syncLines(tx, order);

      if (events.length > 0) {
        const outboxStore = new PrismaOutboxStoreInTransaction(tx);
        await outboxStore.save(events.map((event) => this.toOutboxMessage(order.id, event)));
      }
    });
  }

  private async syncLines(tx: Prisma.TransactionClient, order: Order): Promise<void> {
    const existing = await tx.orderLine.findMany({ where: { orderId: order.id } });
    const desiredIds = new Set(order.getLines().map((line) => line.id));

    for (const line of order.getLines()) {
      await tx.orderLine.upsert({
        where: { id: line.id },
        create: {
          id: line.id,
          orderId: order.id,
          productId: line.getProductId(),
          variantId: line.getVariantId() ?? null,
          quantity: line.getQuantity().value,
          unitPriceAmount: line.getUnitPrice().amount,
          unitPriceCurrency: line.getUnitPrice().currency,
          createdAt: line.createdAt,
          updatedAt: line.updatedAt,
        },
        update: {
          productId: line.getProductId(),
          variantId: line.getVariantId() ?? null,
          quantity: line.getQuantity().value,
          unitPriceAmount: line.getUnitPrice().amount,
          unitPriceCurrency: line.getUnitPrice().currency,
          updatedAt: line.updatedAt,
        },
      });
    }

    for (const row of existing) {
      if (!desiredIds.has(row.id)) {
        await tx.orderLine.delete({ where: { id: row.id } });
      }
    }
  }

  private defaultInclude() {
    return { lines: true } as const;
  }

  private toDomain(row: OrderRow): Order {
    return Order.reconstitute({
      id: row.id,
      orderNumber: OrderNumber.create(row.orderNumber),
      customerId: row.customerId,
      status: row.status as OrderStatus,
      total: Money.create(Number(row.totalAmount), row.totalCurrency),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      lines: row.lines.map((line) =>
        OrderLine.create(
          line.id,
          line.productId,
          Quantity.create(line.quantity),
          Money.create(Number(line.unitPriceAmount), line.unitPriceCurrency),
          line.variantId ?? undefined,
        ),
      ),
      adjustments: [],
      addresses: [],
      paymentReferences: [],
      shipmentReferences: [],
    });
  }

  private toOutboxMessage(aggregateId: string, event: DomainEvent): OutboxMessage {
    return {
      id: randomUUID(),
      aggregateId,
      aggregateType: 'Order',
      eventType: event.eventName,
      payload: 'payload' in event ? (event as { payload: unknown }).payload : {},
      occurredOn: event.occurredOn,
    };
  }
}
