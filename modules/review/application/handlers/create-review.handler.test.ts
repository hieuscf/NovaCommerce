import { describe, expect, it, vi } from 'vitest';
import { Product } from '../../../catalog/domain/aggregates/product';
import { ProductName } from '../../../catalog/domain/value-objects/product-name';
import { Money } from '../../../catalog/domain/value-objects/money';
import { ProductSlug } from '../../../catalog/domain/value-objects/product-slug';
import { User } from '../../../user/domain/aggregates/user';
import { UserProfile } from '../../../user/domain/entities/user-profile';
import { DisplayName } from '../../../user/domain/value-objects/display-name';
import { UserId } from '../../../user/domain/value-objects/user-id';
import { CreateReviewHandler } from './create-review.handler';

describe('CreateReviewHandler', () => {
  it('creates review when product and customer exist', async () => {
    const user = User.create(
      UserId.create('33333333-3333-3333-3333-333333333333'),
      'identity-1',
      UserProfile.create('profile-1', DisplayName.create('Jane Doe')),
    ).getValue();

    const product = Product.create(
      '11111111-1111-1111-1111-111111111111',
      ProductName.create('Sample Product'),
      ProductSlug.create('sample-product'),
      Money.create(1000, 'USD'),
    ).getValue();

    const handler = new CreateReviewHandler(
      { findByIdentityId: vi.fn().mockResolvedValue(user) },
      { findById: vi.fn().mockResolvedValue(product) },
      { save: vi.fn().mockResolvedValue(undefined) },
    );

    const result = await handler.execute({
      identityId: 'identity-1',
      productId: product.id,
      rating: 5,
      text: 'Excellent',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().rating).toBe(5);
    expect(result.getValue().status).toBe('draft');
  });
});
