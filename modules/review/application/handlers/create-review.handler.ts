import { randomUUID } from 'node:crypto';
import { Result } from '@novacommerce/building-blocks';
import type { IProductRepository } from '../../../catalog/domain/repositories/i-product-repository';
import type { IUserRepository } from '../../../user/domain/repositories/i-user-repository';
import { Review } from '../../domain/aggregates/review';
import type { IReviewRepository } from '../../domain/repositories/i-review-repository';
import { ProductReference } from '../../domain/value-objects/product-reference';
import { Rating } from '../../domain/value-objects/rating';
import { ReviewText } from '../../domain/value-objects/review-text';
import type { ReviewResponseDto } from '../dto/review-response.dto';
import { ReviewApplicationError } from '../errors/review-application.error';
import { mapReviewToDto } from '../mappers/map-review-to-dto';

export interface CreateReviewCommand {
  readonly identityId: string;
  readonly productId: string;
  readonly variantId?: string;
  readonly rating: number;
  readonly text: string;
}

export class CreateReviewHandler {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly productRepository: IProductRepository,
    private readonly reviewRepository: IReviewRepository,
  ) {}

  async execute(command: CreateReviewCommand): Promise<Result<ReviewResponseDto, ReviewApplicationError>> {
    try {
      const user = await this.userRepository.findByIdentityId(command.identityId);
      if (!user) {
        return Result.fail(new ReviewApplicationError('Customer profile not found', 'USER_NOT_FOUND'));
      }

      const product = await this.productRepository.findById(command.productId);
      if (!product) {
        return Result.fail(new ReviewApplicationError('Product not found', 'PRODUCT_NOT_FOUND'));
      }

      const productReference = ProductReference.create(command.productId, command.variantId);
      const rating = Rating.create(command.rating);
      const text = ReviewText.create(command.text);

      const createResult = Review.create(randomUUID(), productReference, user.id, rating, text);
      if (createResult.isFailure) {
        return Result.fail(
          new ReviewApplicationError(createResult.getError().message, createResult.getError().code),
        );
      }

      const review = createResult.getValue();
      await this.reviewRepository.save(review);
      return Result.ok(mapReviewToDto(review));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create review';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'CREATE_REVIEW_FAILED';
      return Result.fail(new ReviewApplicationError(message, code));
    }
  }
}
