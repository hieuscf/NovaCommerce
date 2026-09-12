import { describe, expect, it, vi } from 'vitest';
import { Payment } from '../../domain/aggregates/payment';
import { Money } from '../../domain/value-objects/money';
import { PaymentMethod } from '../../domain/value-objects/payment-method';
import { PaymentReference } from '../../domain/value-objects/payment-reference';
import { PrismaPaymentRepository } from './prisma-payment-repository';

describe('PrismaPaymentRepository', () => {
  it('persists payment and outbox events in a transaction', async () => {
    const outboxMessages: unknown[] = [];

    const tx = {
      payment: {
        upsert: vi.fn(async ({ create }: { create: { id: string } }) => create),
      },
      paymentAttempt: {
        findMany: vi.fn().mockResolvedValue([]),
        upsert: vi.fn(),
        delete: vi.fn(),
      },
      paymentTransaction: {
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
      payment: { findUnique: vi.fn() },
      $transaction: vi.fn(async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx)),
    };

    const outboxStore = { save: vi.fn() };
    const repository = new PrismaPaymentRepository(prisma as never, outboxStore);

    const payment = Payment.initiate(
      '11111111-1111-1111-1111-111111111111',
      PaymentReference.create('PAY-TEST001'),
      '22222222-2222-2222-2222-222222222222',
      Money.create(99.99, 'USD'),
      PaymentMethod.create('vnpay'),
      '33333333-3333-3333-3333-333333333333',
    ).getValue();

    await repository.save(payment);

    expect(prisma.$transaction).toHaveBeenCalledOnce();
    expect(outboxMessages).toHaveLength(1);
    expect((outboxMessages[0] as { eventType: string }).eventType).toBe('PaymentInitiated');
  });

  it('persists PaymentSucceeded outbox event after confirmation', async () => {
    const outboxMessages: unknown[] = [];

    const tx = {
      payment: {
        upsert: vi.fn(async ({ create }: { create: { id: string } }) => create),
      },
      paymentAttempt: {
        findMany: vi.fn().mockResolvedValue([]),
        upsert: vi.fn(),
        delete: vi.fn(),
      },
      paymentTransaction: {
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
      payment: { findUnique: vi.fn() },
      $transaction: vi.fn(async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx)),
    };

    const repository = new PrismaPaymentRepository(prisma as never, { save: vi.fn() });
    const payment = Payment.initiate(
      '11111111-1111-1111-1111-111111111111',
      PaymentReference.create('PAY-TEST001'),
      '22222222-2222-2222-2222-222222222222',
      Money.create(99.99, 'USD'),
      PaymentMethod.create('vnpay'),
      '33333333-3333-3333-3333-333333333333',
    ).getValue();
    payment.pullDomainEvents();

    payment.markFailed('Provider timeout');
    await repository.save(payment);

    expect(outboxMessages).toHaveLength(1);
    expect((outboxMessages[0] as { eventType: string }).eventType).toBe('PaymentFailed');
  });
});
