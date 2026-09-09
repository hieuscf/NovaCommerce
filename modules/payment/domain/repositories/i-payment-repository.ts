import type { Payment } from '../aggregates/payment';
import type { PaymentReference } from '../value-objects/payment-reference';

export interface IPaymentRepository {
  findById(id: string): Promise<Payment | null>;
  findByReference(reference: PaymentReference): Promise<Payment | null>;
  save(payment: Payment): Promise<void>;
}
