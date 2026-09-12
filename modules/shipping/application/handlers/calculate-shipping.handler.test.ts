import { Result } from '@novacommerce/building-blocks';
import { describe, expect, it, vi } from 'vitest';
import type { IShippingProvider } from '../contracts/i-shipping-provider';
import { CalculateShippingHandler } from './calculate-shipping.handler';

describe('CalculateShippingHandler', () => {
  it('returns shipping quote from provider', async () => {
    const provider: IShippingProvider = {
      calculateQuote: vi.fn().mockResolvedValue(
        Result.ok({
          methodCode: 'standard',
          amount: 7,
          currency: 'USD',
          estimatedDays: 5,
        }),
      ),
    };

    const handler = new CalculateShippingHandler(provider);
    const result = await handler.execute({
      methodCode: 'standard',
      destinationCountry: 'US',
      itemCount: 2,
      currency: 'USD',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual({
      methodCode: 'standard',
      methodName: 'standard',
      amount: 7,
      currency: 'USD',
      estimatedDays: 5,
    });
  });

  it('rejects invalid item count', async () => {
    const provider: IShippingProvider = {
      calculateQuote: vi.fn(),
    };

    const handler = new CalculateShippingHandler(provider);
    const result = await handler.execute({
      methodCode: 'standard',
      destinationCountry: 'US',
      itemCount: 0,
      currency: 'USD',
    });

    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('INVALID_ITEM_COUNT');
  });
});
