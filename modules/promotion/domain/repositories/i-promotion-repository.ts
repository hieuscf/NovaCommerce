import type { Promotion } from '../aggregates/promotion';

export interface IPromotionRepository {
  findById(id: string): Promise<Promotion | null>;
  save(promotion: Promotion): Promise<void>;
}
