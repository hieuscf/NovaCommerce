import { describe, expect, it } from 'vitest';
import { StubPaymentProvider } from './stub-payment-provider';

describe('StubPaymentProvider', () => {
  it('returns redirect url when provider is configured', async () => {
    process.env.MOMO_REDIRECT_BASE_URL = 'https://test.momo.vn/pay';

    const provider = new StubPaymentProvider();
    const result = await provider.createIntent({
      paymentId: '11111111-1111-1111-1111-111111111111',
      orderId: 'order-1',
      amount: 100,
      currency: 'USD',
      provider: 'momo',
      customerId: 'customer-1',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().redirectUrl).toContain('order-1');

    delete process.env.MOMO_REDIRECT_BASE_URL;
  });

  it('fails when provider is not configured', async () => {
    delete process.env.PAYPAL_REDIRECT_BASE_URL;

    const provider = new StubPaymentProvider();
    const result = await provider.createIntent({
      paymentId: '11111111-1111-1111-1111-111111111111',
      orderId: 'order-1',
      amount: 100,
      currency: 'USD',
      provider: 'paypal',
      customerId: 'customer-1',
    });

    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('PAYMENT_PROVIDER_NOT_CONFIGURED');
  });
});
