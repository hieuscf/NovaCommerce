import { describe, expect, it } from 'vitest';
import { ReturnApprovedEvent } from '../events/return-approved.event';
import { ReturnRefundedEvent } from '../events/return-refunded.event';
import { ReturnRejectedEvent } from '../events/return-rejected.event';
import { ReturnRequestedEvent } from '../events/return-requested.event';
import { Money } from '../value-objects/money';
import { RETURN_REQUEST_STATUSES } from '../value-objects/return-status';
import { ReturnRequest } from './return-request';

describe('ReturnRequest aggregate', () => {
  const returnRequestId = '11111111-1111-1111-1111-111111111111';
  const orderId = '22222222-2222-2222-2222-222222222222';
  const customerId = '33333333-3333-3333-3333-333333333333';
  const paymentId = '44444444-4444-4444-4444-444444444444';
  const refundAmount = Money.create(100, 'USD');

  function createReturnRequest() {
    return ReturnRequest.create(returnRequestId, orderId, customerId, paymentId, refundAmount);
  }

  it('creates return request with ReturnRequested event', () => {
    const result = createReturnRequest();
    expect(result.isSuccess).toBe(true);

    const returnRequest = result.getValue();
    expect(returnRequest.getStatus().value).toBe(RETURN_REQUEST_STATUSES.REQUESTED);

    const events = returnRequest.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ReturnRequestedEvent);
  });

  it('approves, rejects, and refunds with domain events', () => {
    const returnRequest = createReturnRequest().getValue();
    returnRequest.pullDomainEvents();

    expect(returnRequest.approve().isSuccess).toBe(true);
    let events = returnRequest.pullDomainEvents();
    expect(events[0]).toBeInstanceOf(ReturnApprovedEvent);

    const rejected = ReturnRequest.create(
      '55555555-5555-5555-5555-555555555555',
      orderId,
      customerId,
      paymentId,
      refundAmount,
    ).getValue();
    rejected.pullDomainEvents();
    expect(rejected.reject().isSuccess).toBe(true);
    events = rejected.pullDomainEvents();
    expect(events[0]).toBeInstanceOf(ReturnRejectedEvent);

    expect(returnRequest.markRefunded().isSuccess).toBe(true);
    events = returnRequest.pullDomainEvents();
    expect(events[0]).toBeInstanceOf(ReturnRefundedEvent);
    expect((events[0] as ReturnRefundedEvent).payload.paymentId).toBe(paymentId);
  });

  it('rejects invalid status transitions', () => {
    const returnRequest = createReturnRequest().getValue();
    returnRequest.approve();
    returnRequest.pullDomainEvents();

    expect(returnRequest.approve().isFailure).toBe(true);
    expect(returnRequest.reject().isFailure).toBe(true);
  });
});
