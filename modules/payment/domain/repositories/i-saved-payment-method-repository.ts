import type { SavedPaymentMethod } from '../aggregates/saved-payment-method';

export interface ISavedPaymentMethodRepository {
  findById(id: string): Promise<SavedPaymentMethod | null>;
  findByCustomerId(customerId: string): Promise<SavedPaymentMethod[]>;
  save(method: SavedPaymentMethod): Promise<void>;
  saveMany(methods: readonly SavedPaymentMethod[]): Promise<void>;
  delete(method: SavedPaymentMethod): Promise<void>;
}
