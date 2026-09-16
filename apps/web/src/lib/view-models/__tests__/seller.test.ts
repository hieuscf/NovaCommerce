import { describe, expect, it } from 'vitest';
import {
  isSellerRegisterStepComplete,
  isSellerRegisterStepCurrent,
} from '../seller';

describe('seller register step helpers', () => {
  it('marks earlier steps complete', () => {
    expect(isSellerRegisterStepComplete('business', 'shop')).toBe(true);
    expect(isSellerRegisterStepComplete('shop', 'business')).toBe(false);
    expect(isSellerRegisterStepCurrent('business', 'business')).toBe(true);
  });
});
