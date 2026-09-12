import { Result } from '@novacommerce/building-blocks';
import { ReviewStatus } from '../../domain/aggregates/review';
import type { IReviewRepository } from '../../domain/repositories/i-review-repository';
import type { ReviewResponseDto } from '../dto/review-response.dto';
import { ReviewApplicationError } from '../errors/review-application.error';
import { mapReviewToDto } from '../mappers/map-review-to-dto';

export interface GetReviewByIdQuery {
  readonly reviewId: string;
  readonly includeDraft?: boolean;
}

export class GetReviewByIdHandler {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(query: GetReviewByIdQuery): Promise<Result<ReviewResponseDto, ReviewApplicationError>> {
    const review = await this.reviewRepository.findById(query.reviewId);
    if (!review) {
      return Result.fail(new ReviewApplicationError('Review not found', 'REVIEW_NOT_FOUND'));
    }

    if (!query.includeDraft && review.getStatus() !== ReviewStatus.PUBLISHED) {
      return Result.fail(new ReviewApplicationError('Review not found', 'REVIEW_NOT_FOUND'));
    }

    return Result.ok(mapReviewToDto(review));
  }
}
