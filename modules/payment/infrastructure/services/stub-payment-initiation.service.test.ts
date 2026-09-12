import { describe, expect, it } from 'vitest';
import { StubPaymentInitiationService } from './stub-payment-initiation.service';

describe('StubPaymentInitiationService', () => {
  it('returns redirect url when provider is configured', async () => {
    process.env.MOMO_REDIRECT_BASE_URL = 'https://test.momo.vn/pay';

    const service = new StubPaymentInitiationService();
    const result = await service.initiate({
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

    const service = new StubPaymentInitiationService();
    const result = await service.initiate({
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
