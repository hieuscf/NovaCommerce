import type { CheckoutSession } from '../aggregates/checkout-session';

export interface ICheckoutSessionRepository {
  findById(id: string): Promise<CheckoutSession | null>;
  save(session: CheckoutSession): Promise<void>;
}
