import { describe, expect, it, vi } from 'vitest';
import { User } from '../../domain/aggregates/user';
import { UserProfile } from '../../domain/entities/user-profile';
import { DisplayName } from '../../domain/value-objects/display-name';
import { UserId } from '../../domain/value-objects/user-id';
import { PrismaUserRepository } from './prisma-user-repository';

describe('PrismaUserRepository', () => {
  it('persists user and outbox events in a transaction', async () => {
    const outboxMessages: unknown[] = [];
    const userRows = new Map<string, unknown>();

    const tx = {
      user: {
        upsert: vi.fn(async ({ create }: { create: { id: string } }) => {
          userRows.set(create.id, create);
          return create;
        }),
      },
      userProfile: {
        upsert: vi.fn(async ({ create }: { create: { id: string } }) => create),
      },
      userAddress: {
        findMany: vi.fn().mockResolvedValue([]),
        upsert: vi.fn(),
        delete: vi.fn(),
      },
      userPreference: {
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
      user: { findUnique: vi.fn() },
      $transaction: vi.fn(async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx)),
    };

    const outboxStore = { save: vi.fn() };
    const repository = new PrismaUserRepository(prisma as never, outboxStore);

    const user = User.create(
      UserId.create('11111111-1111-1111-1111-111111111111'),
      '22222222-2222-2222-2222-222222222222',
      UserProfile.create('profile-1', DisplayName.create('Jane Doe')),
    ).getValue();

    await repository.save(user);

    expect(prisma.$transaction).toHaveBeenCalledOnce();
    expect(outboxMessages).toHaveLength(1);
    expect((outboxMessages[0] as { eventType: string }).eventType).toBe('UserCreated');
  });
});
