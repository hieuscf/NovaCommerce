import { describe, expect, it } from 'vitest';
import {
  checkoutCrumbsForStage,
  checkoutStageForStep,
  formatCheckoutAddress,
  isCheckoutStepComplete,
  isCheckoutStepCurrent,
  toCheckoutPaymentProvider,
} from '../checkout';

describe('checkout stage helpers', () => {
  it('maps stepper ids onto the combined details stage', () => {
    expect(checkoutStageForStep('information')).toBe('details');
    expect(checkoutStageForStep('shipping')).toBe('details');
    expect(checkoutStageForStep('payment')).toBe('payment');
    expect(checkoutStageForStep('review')).toBe('review');
  });

  it('treats information as complete while shipping is the current details step', () => {
    expect(isCheckoutStepComplete('information', 'details')).toBe(true);
    expect(isCheckoutStepCurrent('shipping', 'details')).toBe(true);
    expect(isCheckoutStepCurrent('information', 'details')).toBe(false);
    expect(isCheckoutStepComplete('shipping', 'payment')).toBe(true);
    expect(isCheckoutStepCurrent('payment', 'payment')).toBe(true);
  });

  it('formats a shipping address with resolved labels', () => {
    expect(
      formatCheckoutAddress(
        {
          addressLine1: '123 Tech Street',
          addressLine2: '',
          city: 'Ho Chi Minh City',
          state: 'HCM',
          postalCode: '700000',
          country: 'VN',
        },
        [{ value: 'VN', label: 'Vietnam' }],
        [{ value: 'HCM', label: 'Ho Chi Minh City' }],
      ),
    ).toBe('123 Tech Street, Ho Chi Minh City, Ho Chi Minh City, 700000, Vietnam');
  });

  it('maps Alloy payment tiles onto Gateway paymentProvider values', () => {
    expect(toCheckoutPaymentProvider('card')).toBe('vnpay');
    expect(toCheckoutPaymentProvider('paypal')).toBe('paypal');
    expect(toCheckoutPaymentProvider('qr_pay')).toBe('vnpay');
    expect(toCheckoutPaymentProvider('google_pay')).toBe('momo');
  });

  it('adds a Payment crumb on the payment stage', () => {
    expect(checkoutCrumbsForStage('payment').at(-1)).toMatchObject({
      label: 'Payment',
      current: true,
    });
  });
});
