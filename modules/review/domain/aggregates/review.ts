import { AggregateRoot, Result } from '@novacommerce/building-blocks';
import { ReviewDomainError } from '../errors/review-domain.error';
import { ReviewMedia } from '../entities/review-media';
import { ReviewCreatedEvent } from '../events/review-created.event';
import { ReviewPublishedEvent } from '../events/review-published.event';
import { ReviewUpdatedEvent } from '../events/review-updated.event';
import type { ProductReference } from '../value-objects/product-reference';
import type { Rating } from '../value-objects/rating';
import type { ReviewText } from '../value-objects/review-text';

export enum ReviewStatus { DRAFT = 'draft', PUBLISHED = 'published' }

export class Review extends AggregateRoot<string> {
  private media: ReviewMedia[] = [];

  private constructor(
    id: string, createdAt: Date, updatedAt: Date,
    private productReference: ProductReference, private customerId: string,
    private rating: Rating, private text: ReviewText, private status: ReviewStatus,
  ) { super(id, createdAt, updatedAt); }

  static create(
    id: string, productReference: ProductReference, customerId: string, rating: Rating, text: ReviewText,
  ): Result<Review, ReviewDomainError> {
    if (!customerId?.trim()) {
      return Result.fail(new ReviewDomainError('Customer id is required', 'INVALID_CUSTOMER_ID'));
    }
    const now = new Date();
    const review = new Review(id, now, now, productReference, customerId.trim(), rating, text, ReviewStatus.DRAFT);
    review.addDomainEvent(new ReviewCreatedEvent(id, now, { productId: productReference.productId, rating: rating.value }));
    return Result.ok(review);
  }

  static reconstitute(props: {
    id: string; productReference: ProductReference; customerId: string;
    rating: Rating; text: ReviewText; status: ReviewStatus;
    createdAt: Date; updatedAt: Date; media: ReviewMedia[];
  }): Review {
    const review = new Review(props.id, props.createdAt, props.updatedAt, props.productReference, props.customerId, props.rating, props.text, props.status);
    review.media = [...props.media];
    return review;
  }

  update(rating: Rating, text: ReviewText): Result<void, ReviewDomainError> {
    if (this.status === ReviewStatus.PUBLISHED) {
      return Result.fail(new ReviewDomainError('Published review cannot be updated', 'REVIEW_PUBLISHED'));
    }
    this.rating = rating;
    this.text = text;
    this.updatedAt = new Date();
    this.addDomainEvent(new ReviewUpdatedEvent(this.id, new Date(), {}));
    return Result.ok(undefined);
  }

  publish(): Result<void, ReviewDomainError> {
    if (this.status === ReviewStatus.PUBLISHED) {
      return Result.fail(new ReviewDomainError('Review is already published', 'REVIEW_ALREADY_PUBLISHED'));
    }
    this.status = ReviewStatus.PUBLISHED;
    this.updatedAt = new Date();
    this.addDomainEvent(new ReviewPublishedEvent(this.id, new Date(), {}));
    return Result.ok(undefined);
  }

  addMedia(item: ReviewMedia): void { this.media.push(item); this.updatedAt = new Date(); }
  getRating(): Rating { return this.rating; }
  getText(): ReviewText { return this.text; }
  getStatus(): ReviewStatus { return this.status; }
  getProductReference(): ProductReference { return this.productReference; }
}
