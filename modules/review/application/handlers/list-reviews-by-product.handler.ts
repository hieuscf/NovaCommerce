import { Result } from '@novacommerce/building-blocks';
import type { IProductRepository } from '../../../catalog/domain/repositories/i-product-repository';
import { ReviewStatus } from '../../domain/aggregates/review';
import type { IReviewRepository } from '../../domain/repositories/i-review-repository';
import type { ReviewResponseDto } from '../dto/review-response.dto';
import { ReviewApplicationError } from '../errors/review-application.error';
import { mapReviewToDto } from '../mappers/map-review-to-dto';

export interface ListReviewsByProductQuery {
  readonly productId: string;
  readonly includeDraft?: boolean;
}

export class ListReviewsByProductHandler {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly reviewRepository: IReviewRepository,
  ) {}

  async execute(
    query: ListReviewsByProductQuery,
  ): Promise<Result<readonly ReviewResponseDto[], ReviewApplicationError>> {
    const product = await this.productRepository.findById(query.productId);
    if (!product) {
      return Result.fail(new ReviewApplicationError('Product not found', 'PRODUCT_NOT_FOUND'));
    }

    const reviews = await this.reviewRepository.findByProduct({
      productId: query.productId,
      status: query.includeDraft ? undefined : ReviewStatus.PUBLISHED,
    });

    return Result.ok(reviews.map((review) => mapReviewToDto(review)));
  }
}
