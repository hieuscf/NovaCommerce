import { z } from 'zod';
import {
  isCardCvvComplete,
  isCardExpirationValid,
  isCardNumberComplete,
  isOtpComplete,
} from '@/lib/checkout/card-input';
import { CHECKOUT_PAYMENT_METHOD_IDS } from '@/lib/view-models/checkout';
import { emailSchema } from '@/lib/validation/auth-schemas';

const requiredText = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} is too long`);

export const checkoutFormSchema = z
  .object({
    fullName: requiredText('Full name', 120),
    email: emailSchema,
    phone: z
      .string()
      .trim()
      .min(1, 'Phone number is required')
      .refine((value) => value.replace(/\D/g, '').length >= 8, {
        message: 'Enter a valid phone number',
      }),
    createAccount: z.boolean(),
    addressLine1: requiredText('Address', 200),
    addressLine2: z.string().trim().max(200, 'Address line 2 is too long'),
    city: requiredText('City', 100),
    state: z.string().min(1, 'State or province is required'),
    postalCode: requiredText('Postal code', 20),
    country: z.string().min(1, 'Country is required'),
    paymentMethod: z.enum(CHECKOUT_PAYMENT_METHOD_IDS, {
      required_error: 'Choose a payment method',
      invalid_type_error: 'Choose a payment method',
    }),
    cardNumber: z.string(),
    cardholderName: z.string(),
    cardExpiration: z.string(),
    cardCvv: z.string(),
    otpCode: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.paymentMethod !== 'card') {
      return;
    }

    if (!isCardNumberComplete(values.cardNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cardNumber'],
        message: 'Enter a valid card number',
      });
    }

    if (values.cardholderName.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cardholderName'],
        message: 'Cardholder name is required',
      });
    }

    if (!isCardExpirationValid(values.cardExpiration)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cardExpiration'],
        message: 'Enter a valid expiration date',
      });
    }

    if (!isCardCvvComplete(values.cardCvv)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cardCvv'],
        message: 'Enter a valid CVV',
      });
    }

    if (!isOtpComplete(values.otpCode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['otpCode'],
        message: 'Enter the 6-digit OTP code',
      });
    }
  });

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export const CHECKOUT_DETAILS_FIELDS = [
  'fullName',
  'email',
  'phone',
  'addressLine1',
  'addressLine2',
  'city',
  'state',
  'postalCode',
  'country',
] as const satisfies readonly (keyof CheckoutFormValues)[];

export const CHECKOUT_PAYMENT_FIELDS = [
  'paymentMethod',
  'cardNumber',
  'cardholderName',
  'cardExpiration',
  'cardCvv',
  'otpCode',
] as const satisfies readonly (keyof CheckoutFormValues)[];
