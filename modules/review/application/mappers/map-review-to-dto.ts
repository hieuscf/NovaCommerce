import type { Review } from '../../domain/aggregates/review';
import type { ReviewResponseDto } from '../dto/review-response.dto';

export function mapReviewToDto(review: Review): ReviewResponseDto {
  const productReference = review.getProductReference();

  return {
    id: review.id,
    productId: productReference.productId,
    variantId: productReference.variantId,
    customerId: review.getCustomerId(),
    rating: review.getRating().value,
    text: review.getText().value,
    status: review.getStatus(),
    media: review.getMedia().map((item) => ({
      id: item.id,
      url: item.getUrl(),
      mediaType: item.getMediaType(),
      createdAt: item.createdAt.toISOString(),
    })),
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  };
}
