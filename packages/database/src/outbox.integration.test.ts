import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { createTestPrismaClient, resetDatabase } from './test/database-test-utils';

describe('outbox transaction atomicity', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = createTestPrismaClient();
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('persists order and outbox message atomically', async () => {
    const orderId = randomUUID();
    const outboxId = randomUUID();

    await prisma.$transaction([
      prisma.order.create({
        data: {
          id: orderId,
          orderNumber: `ORD-${randomUUID().slice(0, 8)}`,
          customerId: randomUUID(),
          totalAmount: 99.99,
          totalCurrency: 'USD',
        },
      }),
      prisma.outboxMessage.create({
        data: {
          id: outboxId,
          aggregateId: orderId,
          aggregateType: 'Order',
          eventType: 'OrderCreated',
          payload: { orderId },
        },
      }),
    ]);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    const outbox = await prisma.outboxMessage.findUnique({ where: { id: outboxId } });

    expect(order).not.toBeNull();
    expect(outbox).not.toBeNull();
    expect(outbox?.processedAt).toBeNull();
  });

  it('rolls back order and outbox when transaction fails', async () => {
    const orderId = randomUUID();
    const duplicateOrderNumber = `ORD-${randomUUID().slice(0, 8)}`;

    await prisma.order.create({
      data: {
        id: randomUUID(),
        orderNumber: duplicateOrderNumber,
        customerId: randomUUID(),
        totalAmount: 10,
        totalCurrency: 'USD',
      },
    });

    await expect(
      prisma.$transaction(async (tx) => {
        await tx.order.create({
          data: {
            id: orderId,
            orderNumber: duplicateOrderNumber,
            customerId: randomUUID(),
            totalAmount: 20,
            totalCurrency: 'USD',
          },
        });

        await tx.outboxMessage.create({
          data: {
            id: randomUUID(),
            aggregateId: orderId,
            aggregateType: 'Order',
            eventType: 'OrderCreated',
            payload: { orderId },
          },
        });
      }),
    ).rejects.toThrow();

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    const outboxMessages = await prisma.outboxMessage.findMany({
      where: { aggregateId: orderId },
    });

    expect(order).toBeNull();
    expect(outboxMessages).toHaveLength(0);
  });
});
