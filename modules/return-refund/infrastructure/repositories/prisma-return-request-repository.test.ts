import { describe, expect, it, vi } from 'vitest';
import { ReturnRequest } from '../../domain/aggregates/return-request';
import { Money } from '../../domain/value-objects/money';
import { PrismaReturnRequestRepository } from './prisma-return-request-repository';

describe('PrismaReturnRequestRepository', () => {
  it('persists return request and outbox events in a transaction', async () => {
    const outboxMessages: unknown[] = [];

    const tx = {
      returnRequest: {
        upsert: vi.fn(),
      },
      outboxMessage: {
        createMany: vi.fn(async ({ data }: { data: unknown[] }) => {
          outboxMessages.push(...data);
        }),
      },
    };

    const prisma = {
      returnRequest: { findUnique: vi.fn(), findFirst: vi.fn() },
      $transaction: vi.fn(async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx)),
    };

    const repository = new PrismaReturnRequestRepository(prisma as never, { save: vi.fn() });
    const returnRequest = ReturnRequest.create(
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
      '33333333-3333-3333-3333-333333333333',
      '44444444-4444-4444-4444-444444444444',
      Money.create(100, 'USD'),
    ).getValue();

    await repository.save(returnRequest);

    expect(prisma.$transaction).toHaveBeenCalledOnce();
    expect(outboxMessages).toHaveLength(1);
    expect((outboxMessages[0] as { eventType: string }).eventType).toBe('ReturnRequested');
  });
});
