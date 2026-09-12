import { describe, expect, it, vi } from 'vitest';
import { Review } from '../../domain/aggregates/review';
import { ProductReference } from '../../domain/value-objects/product-reference';
import { Rating } from '../../domain/value-objects/rating';
import { ReviewText } from '../../domain/value-objects/review-text';
import { PrismaReviewRepository } from './prisma-review-repository';

describe('PrismaReviewRepository', () => {
  it('persists review and ReviewCreated outbox event in a transaction', async () => {
    const outboxMessages: unknown[] = [];

    const tx = {
      review: {
        upsert: vi.fn(),
      },
      reviewMedia: {
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
      review: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      $transaction: vi.fn(async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx)),
    };

    const repository = new PrismaReviewRepository(prisma as never, { save: vi.fn() });
    const review = Review.create(
      '22222222-2222-2222-2222-222222222222',
      ProductReference.create('11111111-1111-1111-1111-111111111111'),
      '33333333-3333-3333-3333-333333333333',
      Rating.create(5),
      ReviewText.create('Excellent product'),
    ).getValue();

    await repository.save(review);

    expect(tx.review.upsert).toHaveBeenCalled();
    expect(outboxMessages).toHaveLength(1);
    expect((outboxMessages[0] as { eventType: string }).eventType).toBe('ReviewCreated');
  });
});
