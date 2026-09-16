import { z } from 'zod';
import { emailSchema } from '@/lib/validation/auth-schemas';

const requiredText = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} is too long`);

export const sellerRegisterSchema = z.object({
  businessName: requiredText('Business name', 120),
  businessType: z.string().min(1, 'Business type is required'),
  legalBusinessName: requiredText('Legal business name', 160),
  taxId: requiredText('Tax ID / business registration number', 40),
  businessEmail: emailSchema,
  phoneCountry: z.string().min(1, 'Country code is required'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .refine((value) => value.replace(/\D/g, '').length >= 8, {
      message: 'Enter a valid phone number',
    }),
  addressLine1: requiredText('Address line 1', 200),
  addressLine2: z.string().trim().max(200, 'Address line 2 is too long'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State or province is required'),
  postalCode: requiredText('Postal code', 20),
  shopName: requiredText('Shop name', 120),
  shopSlug: z
    .string()
    .trim()
    .min(1, 'Shop URL is required')
    .max(80, 'Shop URL is too long')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens'),
  shopCategory: z.string().min(1, 'Shop category is required'),
  shopDescription: requiredText('Shop description', 500),
  representativeName: requiredText('Authorized representative', 120),
  documentType: z.string().min(1, 'Document type is required'),
  documentNumber: requiredText('Document number', 80),
});

export type SellerRegisterFormValues = z.infer<typeof sellerRegisterSchema>;

export const SELLER_BUSINESS_FIELDS = [
  'businessName',
  'businessType',
  'legalBusinessName',
  'taxId',
  'businessEmail',
  'phoneCountry',
  'phone',
  'addressLine1',
  'addressLine2',
  'city',
  'state',
  'postalCode',
] as const satisfies readonly (keyof SellerRegisterFormValues)[];

export const SELLER_SHOP_FIELDS = [
  'shopName',
  'shopSlug',
  'shopCategory',
  'shopDescription',
] as const satisfies readonly (keyof SellerRegisterFormValues)[];

export const SELLER_VERIFICATION_FIELDS = [
  'representativeName',
  'documentType',
  'documentNumber',
] as const satisfies readonly (keyof SellerRegisterFormValues)[];

export function toShopSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
