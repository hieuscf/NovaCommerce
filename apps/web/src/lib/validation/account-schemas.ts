import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(100, 'Display name is too long'),
  phoneNumber: z
    .string()
    .max(30, 'Phone number is too long')
    .optional()
    .or(z.literal('')),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export const addressFormSchema = z.object({
  label: z.string().min(1, 'Label is required').max(50, 'Label is too long'),
  line1: z.string().min(1, 'Address line is required'),
  line2: z.string().optional().or(z.literal('')),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State / province is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z
    .string()
    .length(2, 'Use a 2-letter country code (e.g. VN)')
    .transform((value) => value.toUpperCase()),
  isDefault: z.boolean().optional(),
});

export type AddressFormData = z.infer<typeof addressFormSchema>;

export const notificationPreferencesSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  sms: z.boolean(),
  marketingEmail: z.boolean(),
});

export type NotificationPreferencesFormData = z.infer<typeof notificationPreferencesSchema>;

/**
 * Add saved card — CVV/CVC must not appear in this schema (ADR-006).
 * Shoppers re-enter CVV only when charging at checkout.
 */
export const savedCardFormSchema = z.object({
  cardNumber: z
    .string()
    .refine((value) => {
      const digits = value.replace(/\D/g, '');
      return digits.length >= 13 && digits.length <= 19;
    }, 'Enter a valid card number'),
  cardholderName: z.string().trim().min(2, 'Cardholder name is required').max(120),
  cardExpiration: z.string().refine((value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 4) return false;
    const month = Number(digits.slice(0, 2));
    return month >= 1 && month <= 12;
  }, 'Enter a valid expiration date (MM/YY)'),
  isDefault: z.boolean().optional(),
});

export type SavedCardFormData = z.infer<typeof savedCardFormSchema>;
