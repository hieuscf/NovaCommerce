import { randomUUID } from 'node:crypto';
import { Result } from '@novacommerce/building-blocks';
import type { IUserRepository } from '../../../user/domain/repositories/i-user-repository';
import { ReviewMedia } from '../../domain/entities/review-media';
import type { IReviewRepository } from '../../domain/repositories/i-review-repository';
import type { IReviewImageStorage } from '../contracts/i-review-image-storage';
import type { ReviewResponseDto } from '../dto/review-response.dto';
import { ReviewApplicationError } from '../errors/review-application.error';
import { mapReviewToDto } from '../mappers/map-review-to-dto';

export interface AddReviewImageCommand {
  readonly identityId: string;
  readonly reviewId: string;
  readonly contentBase64: string;
  readonly contentType: string;
}

export class AddReviewImageHandler {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly reviewRepository: IReviewRepository,
    private readonly reviewImageStorage: IReviewImageStorage,
  ) {}

  async execute(command: AddReviewImageCommand): Promise<Result<ReviewResponseDto, ReviewApplicationError>> {
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

      const content = Buffer.from(command.contentBase64, 'base64');
      if (content.length === 0) {
        return Result.fail(new ReviewApplicationError('Image content is required', 'INVALID_REVIEW_IMAGE'));
      }

      const mediaId = randomUUID();
      const uploaded = await this.reviewImageStorage.upload({
        reviewId: review.id,
        mediaId,
        content: new Uint8Array(content),
        contentType: command.contentType,
      });

      const media = ReviewMedia.create(mediaId, uploaded.url, uploaded.mediaType);
      const addMediaResult = review.addMedia(media);
      if (addMediaResult.isFailure) {
        return Result.fail(
          new ReviewApplicationError(addMediaResult.getError().message, addMediaResult.getError().code),
        );
      }

      await this.reviewRepository.save(review);
      return Result.ok(mapReviewToDto(review));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add review image';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'ADD_REVIEW_IMAGE_FAILED';
      return Result.fail(new ReviewApplicationError(message, code));
    }
  }
}
