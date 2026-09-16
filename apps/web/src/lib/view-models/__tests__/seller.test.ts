import { describe, expect, it } from 'vitest';
import {
  isSellerRegisterStepComplete,
  isSellerRegisterStepCurrent,
} from '../seller';

describe('seller register step helpers', () => {
  it('marks earlier steps complete', () => {
    expect(isSellerRegisterStepComplete('verification', 'terms')).toBe(true);
    expect(isSellerRegisterStepComplete('terms', 'complete')).toBe(true);
    expect(isSellerRegisterStepComplete('terms', 'verification')).toBe(false);
    expect(isSellerRegisterStepCurrent('terms', 'terms')).toBe(true);
  });
});
