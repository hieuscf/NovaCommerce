import { describe, expect, it } from 'vitest';
import { SavedPaymentMethod } from './saved-payment-method';

describe('SavedPaymentMethod', () => {
  it('creates vault metadata without accepting CVV fields', () => {
    const result = SavedPaymentMethod.create({
      id: '11111111-1111-1111-1111-111111111111',
      customerId: '22222222-2222-2222-2222-222222222222',
      provider: 'stub',
      providerToken: 'stub_token',
      brand: 'visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2030,
      cardholderName: 'Alex Johnson',
      isDefault: true,
    });

    expect(result.isSuccess).toBe(true);
    const method = result.getValue();
    expect(method.getLast4()).toBe('4242');
    expect(method.getProviderToken()).toBe('stub_token');
    expect(JSON.stringify(method)).not.toMatch(/cvv|cvc/i);
  });

  it('rejects invalid last4', () => {
    const result = SavedPaymentMethod.create({
      id: '11111111-1111-1111-1111-111111111111',
      customerId: '22222222-2222-2222-2222-222222222222',
      provider: 'stub',
      providerToken: 'stub_token',
      brand: 'visa',
      last4: '42',
      expMonth: 12,
      expYear: 2030,
      cardholderName: 'Alex Johnson',
      isDefault: false,
    });
    expect(result.isFailure).toBe(true);
  });
});
