import { randomUUID } from 'node:crypto';
import type { DomainEvent, IOutboxStore, OutboxMessage } from '@novacommerce/building-blocks';
import type { DeliveryStatus as PrismaDeliveryStatus, Prisma, PrismaClient } from '@prisma/client';
import { Notification } from '../../domain/aggregates/notification';
import { DeliveryStatus, NotificationDelivery } from '../../domain/entities/notification-delivery';
import type {
  INotificationRepository,
  PendingDeliveryRecord,
} from '../../domain/repositories/i-notification-repository';
import { PrismaOutboxStoreInTransaction } from '../prisma/prisma-outbox-store';

type NotificationRow = Prisma.NotificationGetPayload<{
  include: {
    deliveries: true;
  };
}>;

export class PrismaNotificationRepository implements INotificationRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly outboxStore: IOutboxStore,
  ) {}

  async findById(id: string): Promise<Notification | null> {
    const row = await this.prisma.notification.findUnique({
      where: { id },
      include: { deliveries: true },
    });

    return row ? this.toDomain(row) : null;
  }

  async findPendingDeliveries(limit: number): Promise<readonly PendingDeliveryRecord[]> {
    const rows = await this.prisma.notificationDelivery.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: {
        id: true,
        notificationId: true,
      },
    });

    return rows.map((row) => ({
      notificationId: row.notificationId,
      deliveryId: row.id,
    }));
  }

  async save(notification: Notification): Promise<void> {
    const events = notification.pullDomainEvents();

    await this.prisma.$transaction(async (tx) => {
      await tx.notification.upsert({
        where: { id: notification.id },
        create: {
          id: notification.id,
          template: notification.getTemplate(),
          payload: notification.getPayload(),
          createdAt: notification.createdAt,
          updatedAt: notification.updatedAt,
        },
        update: {
          template: notification.getTemplate(),
          payload: notification.getPayload(),
          updatedAt: notification.updatedAt,
        },
      });

      await this.syncDeliveries(tx, notification);

      if (events.length > 0) {
        const outboxStore = new PrismaOutboxStoreInTransaction(tx);
        await outboxStore.save(events.map((event) => this.toOutboxMessage(notification.id, event)));
      }
    });
  }

  private async syncDeliveries(tx: Prisma.TransactionClient, notification: Notification): Promise<void> {
    const existing = await tx.notificationDelivery.findMany({
      where: { notificationId: notification.id },
    });
    const desiredIds = new Set(notification.getDeliveries().map((delivery) => delivery.id));

    for (const delivery of notification.getDeliveries()) {
      await tx.notificationDelivery.upsert({
        where: { id: delivery.id },
        create: {
          id: delivery.id,
          notificationId: notification.id,
          channel: delivery.getChannel(),
          recipient: delivery.getRecipient(),
          status: this.toPrismaDeliveryStatus(delivery.getStatus()),
          failureReason: delivery.getFailureReason() ?? null,
          createdAt: delivery.createdAt,
          updatedAt: delivery.updatedAt,
        },
        update: {
          channel: delivery.getChannel(),
          recipient: delivery.getRecipient(),
          status: this.toPrismaDeliveryStatus(delivery.getStatus()),
          failureReason: delivery.getFailureReason() ?? null,
          updatedAt: delivery.updatedAt,
        },
      });
    }

    for (const row of existing) {
      if (!desiredIds.has(row.id)) {
        await tx.notificationDelivery.delete({ where: { id: row.id } });
      }
    }
  }

  private toDomain(row: NotificationRow): Notification {
    return Notification.reconstitute({
      id: row.id,
      template: row.template,
      payload: this.toPayloadRecord(row.payload),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deliveries: row.deliveries.map((delivery) =>
        NotificationDelivery.reconstitute({
          id: delivery.id,
          channel: delivery.channel,
          recipient: delivery.recipient,
          status: this.toDomainDeliveryStatus(delivery.status),
          failureReason: delivery.failureReason ?? undefined,
          createdAt: delivery.createdAt,
          updatedAt: delivery.updatedAt,
        }),
      ),
    });
  }

  private toPayloadRecord(payload: Prisma.JsonValue): Record<string, string> {
    if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(payload).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
    );
  }

  private toPrismaDeliveryStatus(status: DeliveryStatus): PrismaDeliveryStatus {
    return status;
  }

  private toDomainDeliveryStatus(status: PrismaDeliveryStatus): DeliveryStatus {
    switch (status) {
      case DeliveryStatus.SENT:
        return DeliveryStatus.SENT;
      case DeliveryStatus.FAILED:
        return DeliveryStatus.FAILED;
      default:
        return DeliveryStatus.PENDING;
    }
  }

  private toOutboxMessage(aggregateId: string, event: DomainEvent): OutboxMessage {
    return {
      id: randomUUID(),
      aggregateId,
      aggregateType: 'Notification',
      eventType: event.eventName,
      payload: 'payload' in event ? (event as { payload: unknown }).payload : {},
      occurredOn: event.occurredOn,
    };
  }
}
