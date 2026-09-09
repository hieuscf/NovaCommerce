import { BaseEntity } from '@novacommerce/building-blocks';

export enum PaymentAttemptStatus { PENDING = 'pending', SUCCEEDED = 'succeeded', FAILED = 'failed' }

export class PaymentAttempt extends BaseEntity<string> {
  private constructor(
    id: string, createdAt: Date, updatedAt: Date,
    private status: PaymentAttemptStatus, private failureReason?: string,
  ) { super(id, createdAt, updatedAt); }

  static create(id: string): PaymentAttempt {
    return new PaymentAttempt(id, new Date(), new Date(), PaymentAttemptStatus.PENDING);
  }

  markSucceeded(): void { this.status = PaymentAttemptStatus.SUCCEEDED; this.updatedAt = new Date(); }
  markFailed(reason: string): void { this.status = PaymentAttemptStatus.FAILED; this.failureReason = reason; this.updatedAt = new Date(); }
  getStatus(): PaymentAttemptStatus { return this.status; }
}
