import type { Review, ReviewStatus } from '../aggregates/review';

export interface ListReviewsByProductQuery {
  readonly productId: string;
  readonly status?: ReviewStatus;
}

export interface IReviewRepository {
  findById(id: string): Promise<Review | null>;
  findByProduct(query: ListReviewsByProductQuery): Promise<Review[]>;
  save(review: Review): Promise<void>;
}
