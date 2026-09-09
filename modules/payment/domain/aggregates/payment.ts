import { AggregateRoot, Result } from '@novacommerce/building-blocks';
import { PaymentDomainError } from '../errors/payment-domain.error';
import { PaymentAttempt, PaymentAttemptStatus } from '../entities/payment-attempt';
import { PaymentTransaction } from '../entities/payment-transaction';
import { PaymentFailedEvent } from '../events/payment-failed.event';
import { PaymentInitiatedEvent } from '../events/payment-initiated.event';
import { PaymentRefundedEvent } from '../events/payment-refunded.event';
import { PaymentSucceededEvent } from '../events/payment-succeeded.event';
import type { Money } from '../value-objects/money';
import type { PaymentMethod } from '../value-objects/payment-method';
import type { PaymentReference } from '../value-objects/payment-reference';

export enum PaymentStatus { INITIATED = 'initiated', SUCCEEDED = 'succeeded', FAILED = 'failed', REFUNDED = 'refunded' }

export class Payment extends AggregateRoot<string> {
  private attempts: PaymentAttempt[] = [];
  private transactions: PaymentTransaction[] = [];

  private constructor(
    id: string, createdAt: Date, updatedAt: Date,
    private reference: PaymentReference, private orderId: string,
    private amount: Money, private method: PaymentMethod, private status: PaymentStatus,
  ) { super(id, createdAt, updatedAt); }

  static initiate(
    id: string, reference: PaymentReference, orderId: string, amount: Money, method: PaymentMethod, attemptId: string,
  ): Result<Payment, PaymentDomainError> {
    if (!orderId?.trim()) {
      return Result.fail(new PaymentDomainError('Order id is required', 'INVALID_ORDER_ID'));
    }
    const now = new Date();
    const payment = new Payment(id, now, now, reference, orderId.trim(), amount, method, PaymentStatus.INITIATED);
    payment.attempts.push(PaymentAttempt.create(attemptId));
    payment.addDomainEvent(new PaymentInitiatedEvent(id, now, { orderId: orderId.trim(), amount: amount.amount, currency: amount.currency }));
    return Result.ok(payment);
  }

  static reconstitute(props: {
    id: string; reference: PaymentReference; orderId: string; amount: Money; method: PaymentMethod; status: PaymentStatus;
    createdAt: Date; updatedAt: Date; attempts: PaymentAttempt[]; transactions: PaymentTransaction[];
  }): Payment {
    const payment = new Payment(props.id, props.createdAt, props.updatedAt, props.reference, props.orderId, props.amount, props.method, props.status);
    payment.attempts = [...props.attempts];
    payment.transactions = [...props.transactions];
    return payment;
  }

  markSucceeded(transaction: PaymentTransaction): Result<void, PaymentDomainError> {
    if (this.status === PaymentStatus.SUCCEEDED) {
      return Result.fail(new PaymentDomainError('Payment already succeeded', 'PAYMENT_ALREADY_SUCCEEDED'));
    }
    this.status = PaymentStatus.SUCCEEDED;
    this.transactions.push(transaction);
    const attempt = this.attempts[this.attempts.length - 1];
    if (attempt) attempt.markSucceeded();
    this.updatedAt = new Date();
    this.addDomainEvent(new PaymentSucceededEvent(this.id, new Date(), { orderId: this.orderId }));
    return Result.ok(undefined);
  }

  markFailed(reason: string): Result<void, PaymentDomainError> {
    this.status = PaymentStatus.FAILED;
    const attempt = this.attempts[this.attempts.length - 1];
    if (attempt) attempt.markFailed(reason);
    this.updatedAt = new Date();
    this.addDomainEvent(new PaymentFailedEvent(this.id, new Date(), { reason }));
    return Result.ok(undefined);
  }

  refund(refundAmount: Money): Result<void, PaymentDomainError> {
    if (this.status !== PaymentStatus.SUCCEEDED) {
      return Result.fail(new PaymentDomainError('Only succeeded payments can be refunded', 'PAYMENT_NOT_REFUNDABLE'));
    }
    this.status = PaymentStatus.REFUNDED;
    this.updatedAt = new Date();
    this.addDomainEvent(new PaymentRefundedEvent(this.id, new Date(), { amount: refundAmount.amount, currency: refundAmount.currency }));
    return Result.ok(undefined);
  }

  getReference(): PaymentReference { return this.reference; }
  getStatus(): PaymentStatus { return this.status; }
  getAmount(): Money { return this.amount; }
  getOrderId(): string { return this.orderId; }
}
