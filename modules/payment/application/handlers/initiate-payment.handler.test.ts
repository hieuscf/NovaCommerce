import { describe, expect, it, vi } from 'vitest';
import { Result } from '@novacommerce/building-blocks';
import { Payment, PaymentStatus } from '../../domain/aggregates/payment';
import { StubPaymentProvider } from '../../infrastructure/providers/stub-payment-provider';
import { InitiatePaymentHandler } from './initiate-payment.handler';

describe('InitiatePaymentHandler', () => {
  it('creates payment intent and persists aggregate', async () => {
    process.env.VNPAY_REDIRECT_BASE_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

    const saved: Payment[] = [];
    const repository = {
      findById: vi.fn(),
      findByReference: vi.fn(),
      save: vi.fn(async (payment: Payment) => {
        saved.push(payment);
      }),
    };

    const handler = new InitiatePaymentHandler(repository, {
      createIntent: vi.fn(async () =>
        Result.ok({ redirectUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?paymentId=test' }),
      ),
    });

    const result = await handler.execute({
      orderId: '22222222-2222-2222-2222-222222222222',
      amount: 100,
      currency: 'USD',
      provider: 'vnpay',
      customerId: '33333333-3333-3333-3333-333333333333',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().status).toBe(PaymentStatus.INITIATED);
    expect(result.getValue().redirectUrl).toContain('sandbox.vnpayment.vn');
    expect(saved).toHaveLength(1);
    expect(saved[0]?.getStatus()).toBe(PaymentStatus.INITIATED);

    delete process.env.VNPAY_REDIRECT_BASE_URL;
  });

  it('fails when provider is not configured', async () => {
    delete process.env.PAYPAL_REDIRECT_BASE_URL;

    const repository = {
      findById: vi.fn(),
      findByReference: vi.fn(),
      save: vi.fn(),
    };

    const handler = new InitiatePaymentHandler(repository, new StubPaymentProvider());

    const result = await handler.execute({
      orderId: '22222222-2222-2222-2222-222222222222',
      amount: 100,
      currency: 'USD',
      provider: 'paypal',
      customerId: '33333333-3333-3333-3333-333333333333',
    });

    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('PAYMENT_PROVIDER_NOT_CONFIGURED');
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('fails when order id is missing', async () => {
    const repository = {
      findById: vi.fn(),
      findByReference: vi.fn(),
      save: vi.fn(),
    };

    const handler = new InitiatePaymentHandler(repository, {
      createIntent: vi.fn(async () => Result.ok({ redirectUrl: 'https://example.com/pay' })),
    });

    const result = await handler.execute({
      orderId: '   ',
      amount: 100,
      currency: 'USD',
      provider: 'vnpay',
      customerId: '33333333-3333-3333-3333-333333333333',
    });

    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('INVALID_ORDER_ID');
    expect(repository.save).not.toHaveBeenCalled();
  });
});
