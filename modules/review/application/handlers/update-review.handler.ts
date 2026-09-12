import { Result } from '@novacommerce/building-blocks';
import type { IUserRepository } from '../../../user/domain/repositories/i-user-repository';
import type { IReviewRepository } from '../../domain/repositories/i-review-repository';
import { Rating } from '../../domain/value-objects/rating';
import { ReviewText } from '../../domain/value-objects/review-text';
import type { ReviewResponseDto } from '../dto/review-response.dto';
import { ReviewApplicationError } from '../errors/review-application.error';
import { mapReviewToDto } from '../mappers/map-review-to-dto';

export interface UpdateReviewCommand {
  readonly identityId: string;
  readonly reviewId: string;
  readonly rating: number;
  readonly text: string;
}

export class UpdateReviewHandler {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly reviewRepository: IReviewRepository,
  ) {}

  async execute(command: UpdateReviewCommand): Promise<Result<ReviewResponseDto, ReviewApplicationError>> {
    try {
      const user = await this.userRepository.findByIdentityId(command.identityId);
      if (!user) {
        return Result.fail(new ReviewApplicationError('Customer profile not found', 'USER_NOT_FOUND'));
      }

      const review = await this.reviewRepository.findById(command.reviewId);
      if (!review) {
        return Result.fail(new ReviewApplicationError('Review not found', 'REVIEW_NOT_FOUND'));
      }

      if (review.getCustomerId() !== user.id) {
        return Result.fail(new ReviewApplicationError('Review does not belong to customer', 'REVIEW_FORBIDDEN'));
      }

      const rating = Rating.create(command.rating);
      const text = ReviewText.create(command.text);
      const updateResult = review.update(rating, text);
      if (updateResult.isFailure) {
        return Result.fail(
          new ReviewApplicationError(updateResult.getError().message, updateResult.getError().code),
        );
      }

      await this.reviewRepository.save(review);
      return Result.ok(mapReviewToDto(review));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update review';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'UPDATE_REVIEW_FAILED';
      return Result.fail(new ReviewApplicationError(message, code));
    }
  }
}
