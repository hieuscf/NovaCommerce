import { describe, expect, it, vi } from 'vitest';
import { Notification } from '../../domain/aggregates/notification';
import { NotificationDelivery } from '../../domain/entities/notification-delivery';
import { PrismaNotificationRepository } from './prisma-notification-repository';

describe('PrismaNotificationRepository', () => {
  it('persists notification deliveries and outbox events in a transaction', async () => {
    const outboxMessages: unknown[] = [];

    const tx = {
      notification: {
        upsert: vi.fn(),
      },
      notificationDelivery: {
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
      notification: {
        findUnique: vi.fn(),
      },
      notificationDelivery: {
        findMany: vi.fn(),
      },
      $transaction: vi.fn(async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx)),
    };

    const outboxStore = { save: vi.fn() };
    const repository = new PrismaNotificationRepository(prisma as never, outboxStore);

    const delivery = NotificationDelivery.create('delivery-1', 'email', 'user@example.com');
    const notification = Notification.request('notification-1', 'order.created', {
      orderNumber: 'ORD-001',
    }, [delivery]).getValue();

    await repository.save(notification);

    expect(tx.notification.upsert).toHaveBeenCalled();
    expect(tx.notificationDelivery.upsert).toHaveBeenCalled();
    expect(outboxMessages).toHaveLength(1);
    expect((outboxMessages[0] as { eventType: string }).eventType).toBe('NotificationRequested');
  });

  it('finds pending deliveries ordered by createdAt', async () => {
    const prisma = {
      notification: { findUnique: vi.fn() },
      notificationDelivery: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'delivery-1', notificationId: 'notification-1' },
        ]),
      },
      $transaction: vi.fn(),
    };

    const repository = new PrismaNotificationRepository(prisma as never, { save: vi.fn() });
    const pending = await repository.findPendingDeliveries(5);

    expect(pending).toEqual([
      { notificationId: 'notification-1', deliveryId: 'delivery-1' },
    ]);
  });
});
