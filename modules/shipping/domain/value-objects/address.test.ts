import { describe, expect, it } from 'vitest';
import { ShippingDomainError } from '../errors/shipping-domain.error';
import { Address } from './address';

describe('Address value object', () => {
  it('creates a normalized address', () => {
    const address = Address.create({
      line1: ' 123 Main St ',
      line2: ' Apt 4 ',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'us',
    });

    expect(address.line1).toBe('123 Main St');
    expect(address.line2).toBe('Apt 4');
    expect(address.country).toBe('US');
  });

  it('rejects missing required fields', () => {
    expect(() =>
      Address.create({
        line1: '',
        city: 'Austin',
        state: 'TX',
        postalCode: '78701',
        country: 'US',
      }),
    ).toThrow(ShippingDomainError);
  });
});
