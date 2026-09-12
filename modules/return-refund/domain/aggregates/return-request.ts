import { AggregateRoot, Result } from '@novacommerce/building-blocks';
import { ReturnRefundDomainError } from '../errors/return-refund-domain.error';
import { ReturnApprovedEvent } from '../events/return-approved.event';
import { ReturnRefundedEvent } from '../events/return-refunded.event';
import { ReturnRejectedEvent } from '../events/return-rejected.event';
import { ReturnRequestedEvent } from '../events/return-requested.event';
import type { Money } from '../value-objects/money';
import { ReturnStatus } from '../value-objects/return-status';

export class ReturnRequest extends AggregateRoot<string> {
  private constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    private orderId: string,
    private customerId: string,
    private paymentId: string,
    private refundAmount: Money,
    private status: ReturnStatus,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(
    id: string,
    orderId: string,
    customerId: string,
    paymentId: string,
    refundAmount: Money,
  ): Result<ReturnRequest, ReturnRefundDomainError> {
    if (!orderId?.trim()) {
      return Result.fail(new ReturnRefundDomainError('Order id is required', 'INVALID_ORDER_ID'));
    }
    if (!customerId?.trim()) {
      return Result.fail(new ReturnRefundDomainError('Customer id is required', 'INVALID_CUSTOMER_ID'));
    }
    if (!paymentId?.trim()) {
      return Result.fail(new ReturnRefundDomainError('Payment id is required', 'INVALID_PAYMENT_ID'));
    }

    const now = new Date();
    const returnRequest = new ReturnRequest(
      id,
      now,
      now,
      orderId.trim(),
      customerId.trim(),
      paymentId.trim(),
      refundAmount,
      ReturnStatus.requested(),
    );

    returnRequest.addDomainEvent(
      new ReturnRequestedEvent(id, now, {
        returnRequestId: id,
        orderId: orderId.trim(),
        customerId: customerId.trim(),
        paymentId: paymentId.trim(),
      }),
    );

    return Result.ok(returnRequest);
  }

  static reconstitute(props: {
    id: string;
    orderId: string;
    customerId: string;
    paymentId: string;
    refundAmount: Money;
    status: ReturnStatus;
    createdAt: Date;
    updatedAt: Date;
  }): ReturnRequest {
    return new ReturnRequest(
      props.id,
      props.createdAt,
      props.updatedAt,
      props.orderId,
      props.customerId,
      props.paymentId,
      props.refundAmount,
      props.status,
    );
  }

  approve(): Result<void, ReturnRefundDomainError> {
    if (!this.status.isRequested()) {
      return Result.fail(new ReturnRefundDomainError('Only requested returns can be approved', 'INVALID_RETURN_STATUS'));
    }

    this.status = ReturnStatus.approved();
    this.updatedAt = new Date();
    this.addDomainEvent(
      new ReturnApprovedEvent(this.id, this.updatedAt, {
        returnRequestId: this.id,
        orderId: this.orderId,
      }),
    );
    return Result.ok(undefined);
  }

  reject(): Result<void, ReturnRefundDomainError> {
    if (!this.status.isRequested()) {
      return Result.fail(new ReturnRefundDomainError('Only requested returns can be rejected', 'INVALID_RETURN_STATUS'));
    }

    this.status = ReturnStatus.rejected();
    this.updatedAt = new Date();
    this.addDomainEvent(
      new ReturnRejectedEvent(this.id, this.updatedAt, {
        returnRequestId: this.id,
        orderId: this.orderId,
      }),
    );
    return Result.ok(undefined);
  }

  markRefunded(): Result<void, ReturnRefundDomainError> {
    if (!this.status.isApproved()) {
      return Result.fail(new ReturnRefundDomainError('Only approved returns can be refunded', 'INVALID_RETURN_STATUS'));
    }

    this.status = ReturnStatus.refunded();
    this.updatedAt = new Date();
    this.addDomainEvent(
      new ReturnRefundedEvent(this.id, this.updatedAt, {
        returnRequestId: this.id,
        orderId: this.orderId,
        paymentId: this.paymentId,
        amount: this.refundAmount.amount,
        currency: this.refundAmount.currency,
      }),
    );
    return Result.ok(undefined);
  }

  getOrderId(): string {
    return this.orderId;
  }

  getCustomerId(): string {
    return this.customerId;
  }

  getPaymentId(): string {
    return this.paymentId;
  }

  getRefundAmount(): Money {
    return this.refundAmount;
  }

  getStatus(): ReturnStatus {
    return this.status;
  }
}
