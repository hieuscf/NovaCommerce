import { describe, expect, it } from 'vitest';
import { StubCardTokenizer } from './stub-card-tokenizer';

describe('StubCardTokenizer', () => {
  it('returns opaque token metadata and does not echo the PAN', () => {
    const tokenizer = new StubCardTokenizer();
    const result = tokenizer.tokenize({
      cardNumber: '4111 1111 1111 1111',
      expMonth: 12,
      expYear: 2030,
      cardholderName: 'Alex Johnson',
    });

    expect(result.last4).toBe('1111');
    expect(result.brand).toBe('visa');
    expect(result.providerToken.startsWith('stub_')).toBe(true);
    expect(JSON.stringify(result)).not.toContain('4111111111111111');
    expect(JSON.stringify(result)).not.toMatch(/cvv|cvc/i);
  });
});
