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
