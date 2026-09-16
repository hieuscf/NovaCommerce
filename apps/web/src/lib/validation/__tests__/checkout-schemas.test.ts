import { describe, expect, it } from 'vitest';
import { checkoutFormSchema } from '../checkout-schemas';

const valid = {
  fullName: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  phone: '+84 912 345 678',
  createAccount: true,
  addressLine1: '123 Tech Street',
  addressLine2: '',
  city: 'Ho Chi Minh City',
  state: 'HCM',
  postalCode: '700000',
  country: 'VN',
  paymentMethod: 'card' as const,
  cardNumber: '4111 1111 1111 1111',
  cardholderName: 'Alex Johnson',
  cardExpiration: '12 / 29',
  cardCvv: '123',
  otpCode: '123456',
};

describe('checkoutFormSchema', () => {
  it('accepts a complete checkout form', () => {
    expect(checkoutFormSchema.parse(valid).fullName).toBe('Alex Johnson');
  });

  it('requires customer and shipping fields', () => {
    const result = checkoutFormSchema.safeParse({
      ...valid,
      fullName: '',
      email: 'not-an-email',
      addressLine1: '',
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.flatten().fieldErrors.fullName?.[0]).toMatch(/required/i);
    expect(result.error.flatten().fieldErrors.email?.[0]).toMatch(/valid email/i);
    expect(result.error.flatten().fieldErrors.addressLine1?.[0]).toMatch(/required/i);
  });

  it('rejects an unknown payment method', () => {
    const result = checkoutFormSchema.safeParse({
      ...valid,
      paymentMethod: 'stripe',
    });

    expect(result.success).toBe(false);
  });

  it('requires card details and OTP only for card payments', () => {
    const missingCard = checkoutFormSchema.safeParse({
      ...valid,
      cardNumber: '',
      otpCode: '',
    });
    expect(missingCard.success).toBe(false);

    const paypal = checkoutFormSchema.safeParse({
      ...valid,
      paymentMethod: 'paypal',
      cardNumber: '',
      cardholderName: '',
      cardExpiration: '',
      cardCvv: '',
      otpCode: '',
    });
    expect(paypal.success).toBe(true);

    const qrPay = checkoutFormSchema.safeParse({
      ...valid,
      paymentMethod: 'qr_pay',
      cardNumber: '',
      cardholderName: '',
      cardExpiration: '',
      cardCvv: '',
      otpCode: '',
    });
    expect(qrPay.success).toBe(true);
  });

  it('requires only CVV when paying with a saved card', () => {
    const result = checkoutFormSchema.safeParse({
      ...valid,
      savedPaymentMethodId: 'card-1',
      cardNumber: '',
      cardholderName: '',
      cardExpiration: '',
      cardCvv: '123',
      otpCode: '',
    });
    expect(result.success).toBe(true);

    const missingCvv = checkoutFormSchema.safeParse({
      ...valid,
      savedPaymentMethodId: 'card-1',
      cardNumber: '',
      cardholderName: '',
      cardExpiration: '',
      cardCvv: '',
      otpCode: '',
    });
    expect(missingCvv.success).toBe(false);
  });
});
