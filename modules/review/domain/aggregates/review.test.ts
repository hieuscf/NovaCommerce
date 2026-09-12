import { describe, expect, it } from 'vitest';
import { Review, ReviewStatus } from './review';
import { ReviewMedia } from '../entities/review-media';
import { ReviewCreatedEvent } from '../events/review-created.event';
import { ReviewPublishedEvent } from '../events/review-published.event';
import { ProductReference } from '../value-objects/product-reference';
import { Rating } from '../value-objects/rating';
import { ReviewText } from '../value-objects/review-text';

describe('Review aggregate', () => {
  const productReference = ProductReference.create('11111111-1111-1111-1111-111111111111');
  const rating = Rating.create(5);
  const text = ReviewText.create('Great product');

  it('creates draft review and emits ReviewCreated', () => {
    const result = Review.create(
      '22222222-2222-2222-2222-222222222222',
      productReference,
      '33333333-3333-3333-3333-333333333333',
      rating,
      text,
    );

    expect(result.isSuccess).toBe(true);
    const review = result.getValue();
    expect(review.getStatus()).toBe(ReviewStatus.DRAFT);

    const events = review.pullDomainEvents();
    expect(events[0]).toBeInstanceOf(ReviewCreatedEvent);
    expect((events[0] as ReviewCreatedEvent).payload.rating).toBe(5);
  });

  it('updates draft review', () => {
    const review = Review.create(
      '22222222-2222-2222-2222-222222222222',
      productReference,
      '33333333-3333-3333-3333-333333333333',
      rating,
      text,
    ).getValue();
    review.pullDomainEvents();

    const updateResult = review.update(Rating.create(4), ReviewText.create('Updated text'));
    expect(updateResult.isSuccess).toBe(true);
    expect(review.getRating().value).toBe(4);
  });

  it('rejects update on published review', () => {
    const review = Review.create(
      '22222222-2222-2222-2222-222222222222',
      productReference,
      '33333333-3333-3333-3333-333333333333',
      rating,
      text,
    ).getValue();
    review.publish();

    const updateResult = review.update(Rating.create(3), ReviewText.create('Too late'));
    expect(updateResult.isFailure).toBe(true);
  });

  it('publishes review and emits ReviewPublished', () => {
    const review = Review.create(
      '22222222-2222-2222-2222-222222222222',
      productReference,
      '33333333-3333-3333-3333-333333333333',
      rating,
      text,
    ).getValue();
    review.pullDomainEvents();

    const publishResult = review.publish();
    expect(publishResult.isSuccess).toBe(true);
    expect(review.getStatus()).toBe(ReviewStatus.PUBLISHED);

    const events = review.pullDomainEvents();
    expect(events[0]).toBeInstanceOf(ReviewPublishedEvent);
  });

  it('adds media to draft review', () => {
    const review = Review.create(
      '22222222-2222-2222-2222-222222222222',
      productReference,
      '33333333-3333-3333-3333-333333333333',
      rating,
      text,
    ).getValue();

    const media = ReviewMedia.create(
      '44444444-4444-4444-4444-444444444444',
      'http://localhost/reviews/image.jpg',
      'image/jpeg',
    );
    const addResult = review.addMedia(media);

    expect(addResult.isSuccess).toBe(true);
    expect(review.getMedia()).toHaveLength(1);
  });
});
