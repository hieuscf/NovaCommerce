import { describe, expect, it } from 'vitest';
import { StubShippingProvider } from './stub-shipping-provider';

describe('StubShippingProvider', () => {
  it('calculates standard shipping quote', async () => {
    const provider = new StubShippingProvider();
    const result = await provider.calculateQuote({
      methodCode: 'standard',
      destinationCountry: 'US',
      itemCount: 2,
      currency: 'USD',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual({
      methodCode: 'standard',
      amount: 7,
      currency: 'USD',
      estimatedDays: 5,
    });
  });

  it('rejects unsupported method', async () => {
    const provider = new StubShippingProvider();
    const result = await provider.calculateQuote({
      methodCode: 'unknown',
      destinationCountry: 'US',
      itemCount: 1,
      currency: 'USD',
    });

    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('SHIPPING_METHOD_NOT_SUPPORTED');
  });
});
