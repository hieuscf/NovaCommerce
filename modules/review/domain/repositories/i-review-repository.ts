import type { Review } from '../aggregates/review';
import type { ProductReference } from '../value-objects/product-reference';

export interface IReviewRepository {
  findById(id: string): Promise<Review | null>;
  findByProduct(productReference: ProductReference): Promise<Review[]>;
  save(review: Review): Promise<void>;
}
