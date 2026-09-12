import { describe, expect, it } from 'vitest';
import { ShippingDomainError } from '../errors/shipping-domain.error';
import { ShippingMethod } from './shipping-method';

describe('ShippingMethod value object', () => {
  it('creates method with code and name', () => {
    const method = ShippingMethod.create('express', 'Express Delivery');
    expect(method.code).toBe('express');
    expect(method.name).toBe('Express Delivery');
  });

  it('defaults name to code when omitted', () => {
    const method = ShippingMethod.create('standard');
    expect(method.name).toBe('standard');
  });

  it('rejects empty code', () => {
    expect(() => ShippingMethod.create('')).toThrow(ShippingDomainError);
  });
});
