import { describe, expect, it, vi } from 'vitest';
import { Payment, PaymentStatus } from '../../domain/aggregates/payment';
import { Money } from '../../domain/value-objects/money';
import { PaymentMethod } from '../../domain/value-objects/payment-method';
import { PaymentReference } from '../../domain/value-objects/payment-reference';
import { ConfirmPaymentHandler } from './confirm-payment.handler';

describe('ConfirmPaymentHandler', () => {
  it('confirms payment and persists succeeded state', async () => {
    const payment = Payment.initiate(
      '11111111-1111-1111-1111-111111111111',
      PaymentReference.create('PAY-TEST001'),
      '22222222-2222-2222-2222-222222222222',
      Money.create(50, 'USD'),
      PaymentMethod.create('vnpay'),
      '33333333-3333-3333-3333-333333333333',
    ).getValue();
    payment.pullDomainEvents();

    const repository = {
      findById: vi.fn(async () => payment),
      findByReference: vi.fn(),
      save: vi.fn(async () => undefined),
    };

    const handler = new ConfirmPaymentHandler(repository);
    const result = await handler.execute({
      paymentId: payment.id,
      providerReference: 'provider-ref-123',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().status).toBe(PaymentStatus.SUCCEEDED);
    expect(repository.save).toHaveBeenCalledOnce();
  });

  it('returns not found when payment does not exist', async () => {
    const repository = {
      findById: vi.fn(async () => null),
      findByReference: vi.fn(),
      save: vi.fn(),
    };

    const handler = new ConfirmPaymentHandler(repository);
    const result = await handler.execute({
      paymentId: '11111111-1111-1111-1111-111111111111',
      providerReference: 'provider-ref-123',
    });

    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('PAYMENT_NOT_FOUND');
  });
});
