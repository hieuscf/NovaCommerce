import { describe, expect, it } from 'vitest';
import { PaymentTransaction } from '../entities/payment-transaction';
import { PaymentFailedEvent } from '../events/payment-failed.event';
import { PaymentInitiatedEvent } from '../events/payment-initiated.event';
import { PaymentRefundedEvent } from '../events/payment-refunded.event';
import { PaymentSucceededEvent } from '../events/payment-succeeded.event';
import { Money } from '../value-objects/money';
import { PaymentMethod } from '../value-objects/payment-method';
import { PaymentReference } from '../value-objects/payment-reference';
import { ProviderReference } from '../value-objects/provider-reference';
import { Payment, PaymentStatus } from './payment';

describe('Payment aggregate', () => {
  const paymentId = '11111111-1111-1111-1111-111111111111';
  const orderId = '22222222-2222-2222-2222-222222222222';
  const reference = PaymentReference.create('PAY-TEST001');
  const amount = Money.create(99.99, 'USD');
  const method = PaymentMethod.create('vnpay');

  function createPayment() {
    return Payment.initiate(paymentId, reference, orderId, amount, method, '33333333-3333-3333-3333-333333333333');
  }

  it('initiates payment with initiated status and PaymentInitiated event', () => {
    const result = createPayment();
    expect(result.isSuccess).toBe(true);

    const payment = result.getValue();
    expect(payment.getStatus()).toBe(PaymentStatus.INITIATED);
    expect(payment.getOrderId()).toBe(orderId);

    const events = payment.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(PaymentInitiatedEvent);
    expect((events[0] as PaymentInitiatedEvent).payload.orderId).toBe(orderId);
  });

  it('marks payment as succeeded and emits PaymentSucceeded', () => {
    const payment = createPayment().getValue();
    payment.pullDomainEvents();

    const transaction = PaymentTransaction.create(
      '44444444-4444-4444-4444-444444444444',
      amount,
      ProviderReference.create('provider-ref-1'),
    );

    const result = payment.markSucceeded(transaction);
    expect(result.isSuccess).toBe(true);
    expect(payment.getStatus()).toBe(PaymentStatus.SUCCEEDED);

    const events = payment.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(PaymentSucceededEvent);
    expect((events[0] as PaymentSucceededEvent).payload.orderId).toBe(orderId);
  });

  it('rejects duplicate success transitions', () => {
    const payment = createPayment().getValue();
    const transaction = PaymentTransaction.create(
      '44444444-4444-4444-4444-444444444444',
      amount,
      ProviderReference.create('provider-ref-1'),
    );

    payment.markSucceeded(transaction);
    const result = payment.markSucceeded(transaction);
    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('PAYMENT_ALREADY_SUCCEEDED');
  });

  it('marks payment as failed and emits PaymentFailed', () => {
    const payment = createPayment().getValue();
    payment.pullDomainEvents();

    const result = payment.markFailed('Card declined');
    expect(result.isSuccess).toBe(true);
    expect(payment.getStatus()).toBe(PaymentStatus.FAILED);

    const events = payment.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(PaymentFailedEvent);
    expect((events[0] as PaymentFailedEvent).payload.reason).toBe('Card declined');
  });

  it('rejects failure after success', () => {
    const payment = createPayment().getValue();
    payment.markSucceeded(
      PaymentTransaction.create(
        '44444444-4444-4444-4444-444444444444',
        amount,
        ProviderReference.create('provider-ref-1'),
      ),
    );

    const result = payment.markFailed('Too late');
    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('PAYMENT_ALREADY_SUCCEEDED');
  });

  it('refunds succeeded payment and emits PaymentRefunded', () => {
    const payment = createPayment().getValue();
    payment.markSucceeded(
      PaymentTransaction.create(
        '44444444-4444-4444-4444-444444444444',
        amount,
        ProviderReference.create('provider-ref-1'),
      ),
    );
    payment.pullDomainEvents();

    const result = payment.refund(amount);
    expect(result.isSuccess).toBe(true);
    expect(payment.getStatus()).toBe(PaymentStatus.REFUNDED);

    const events = payment.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(PaymentRefundedEvent);
  });

  it('rejects refund for non-succeeded payment', () => {
    const payment = createPayment().getValue();
    const result = payment.refund(amount);
    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('PAYMENT_NOT_REFUNDABLE');
  });
});
