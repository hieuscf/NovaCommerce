import { describe, expect, it, vi } from 'vitest';
import { Payment, PaymentStatus } from '../../domain/aggregates/payment';
import { PaymentTransaction } from '../../domain/entities/payment-transaction';
import { Money } from '../../domain/value-objects/money';
import { PaymentMethod } from '../../domain/value-objects/payment-method';
import { PaymentReference } from '../../domain/value-objects/payment-reference';
import { ProviderReference } from '../../domain/value-objects/provider-reference';
import { RefundPaymentHandler } from './refund-payment.handler';

describe('RefundPaymentHandler', () => {
  it('refunds succeeded payment using full amount by default', async () => {
    const payment = Payment.initiate(
      '11111111-1111-1111-1111-111111111111',
      PaymentReference.create('PAY-TEST001'),
      '22222222-2222-2222-2222-222222222222',
      Money.create(50, 'USD'),
      PaymentMethod.create('vnpay'),
      '33333333-3333-3333-3333-333333333333',
    ).getValue();
    payment.markSucceeded(
      PaymentTransaction.create(
        '44444444-4444-4444-4444-444444444444',
        Money.create(50, 'USD'),
        ProviderReference.create('provider-ref-1'),
      ),
    );
    payment.pullDomainEvents();

    const repository = {
      findById: vi.fn(async () => payment),
      findByReference: vi.fn(),
      save: vi.fn(async () => undefined),
    };

    const handler = new RefundPaymentHandler(repository);
    const result = await handler.execute({ paymentId: payment.id });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().status).toBe(PaymentStatus.REFUNDED);
    expect(repository.save).toHaveBeenCalledOnce();
  });
});
