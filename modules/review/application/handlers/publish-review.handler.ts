import { Result } from '@novacommerce/building-blocks';
import type { IReviewRepository } from '../../domain/repositories/i-review-repository';
import type { ReviewResponseDto } from '../dto/review-response.dto';
import { ReviewApplicationError } from '../errors/review-application.error';
import { mapReviewToDto } from '../mappers/map-review-to-dto';

export interface PublishReviewCommand {
  readonly reviewId: string;
}

export class PublishReviewHandler {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(command: PublishReviewCommand): Promise<Result<ReviewResponseDto, ReviewApplicationError>> {
    const review = await this.reviewRepository.findById(command.reviewId);
    if (!review) {
      return Result.fail(new ReviewApplicationError('Review not found', 'REVIEW_NOT_FOUND'));
    }

    const publishResult = review.publish();
    if (publishResult.isFailure) {
      return Result.fail(
        new ReviewApplicationError(publishResult.getError().message, publishResult.getError().code),
      );
    }

    await this.reviewRepository.save(review);
    return Result.ok(mapReviewToDto(review));
  }
}
