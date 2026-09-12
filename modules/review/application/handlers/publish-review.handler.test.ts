import { describe, expect, it, vi } from 'vitest';
import { Review } from '../../domain/aggregates/review';
import { ProductReference } from '../../domain/value-objects/product-reference';
import { Rating } from '../../domain/value-objects/rating';
import { ReviewText } from '../../domain/value-objects/review-text';
import { PublishReviewHandler } from './publish-review.handler';

describe('PublishReviewHandler', () => {
  it('publishes draft review', async () => {
    const review = Review.create(
      '22222222-2222-2222-2222-222222222222',
      ProductReference.create('11111111-1111-1111-1111-111111111111'),
      '33333333-3333-3333-3333-333333333333',
      Rating.create(4),
      ReviewText.create('Good product'),
    ).getValue();

    const handler = new PublishReviewHandler({
      findById: vi.fn().mockResolvedValue(review),
      save: vi.fn().mockResolvedValue(undefined),
    });

    const result = await handler.execute({ reviewId: review.id });
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().status).toBe('published');
  });
});
