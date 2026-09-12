import { describe, expect, it, vi } from 'vitest';
import { User } from '../../../user/domain/aggregates/user';
import { UserProfile } from '../../../user/domain/entities/user-profile';
import { DisplayName } from '../../../user/domain/value-objects/display-name';
import { UserId } from '../../../user/domain/value-objects/user-id';
import { Review } from '../../domain/aggregates/review';
import { ProductReference } from '../../domain/value-objects/product-reference';
import { Rating } from '../../domain/value-objects/rating';
import { ReviewText } from '../../domain/value-objects/review-text';
import { AddReviewImageHandler } from './add-review-image.handler';

describe('AddReviewImageHandler', () => {
  it('uploads image and attaches media to review', async () => {
    const user = User.create(
      UserId.create('33333333-3333-3333-3333-333333333333'),
      'identity-1',
      UserProfile.create('profile-1', DisplayName.create('Jane Doe')),
    ).getValue();

    const review = Review.create(
      '22222222-2222-2222-2222-222222222222',
      ProductReference.create('11111111-1111-1111-1111-111111111111'),
      user.id,
      Rating.create(5),
      ReviewText.create('Great'),
    ).getValue();

    const handler = new AddReviewImageHandler(
      { findByIdentityId: vi.fn().mockResolvedValue(user) },
      {
        findById: vi.fn().mockResolvedValue(review),
        save: vi.fn().mockResolvedValue(undefined),
      },
      {
        upload: vi.fn().mockResolvedValue({
          url: 'http://localhost/bucket/reviews/image.jpg',
          mediaType: 'image/jpeg',
        }),
      },
    );

    const result = await handler.execute({
      identityId: 'identity-1',
      reviewId: review.id,
      contentBase64: Buffer.from('fake-image').toString('base64'),
      contentType: 'image/jpeg',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().media).toHaveLength(1);
  });
});
