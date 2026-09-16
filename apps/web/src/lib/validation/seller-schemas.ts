import { z } from 'zod';
import { emailSchema } from '@/lib/validation/auth-schemas';

export const SHOP_NAME_MAX_LENGTH = 50;
export const SHOP_DESCRIPTION_MAX_LENGTH = 500;
export const SHOP_LOGO_MAX_BYTES = 2 * 1024 * 1024;
export const SHOP_BANNER_MAX_BYTES = 5 * 1024 * 1024;

const PNG_JPEG_TYPES = new Set(['image/png', 'image/jpeg']);

const requiredText = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} is too long`);

const identityNumber = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(20, `${label} is too long`)
    .refine((value) => value.replace(/[\s-]/g, '').length >= 8, {
      message: `Enter a valid ${label.toLowerCase()}`,
    });

export function toShopSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function isImageFile(value: unknown): value is File {
  return typeof File !== 'undefined' && value instanceof File;
}

function imageFileSchema(options: { label: string; maxBytes: number; required: boolean }) {
  const maxMb = options.maxBytes / (1024 * 1024);

  return z
    .custom<File | null>((value) => value == null || isImageFile(value))
    .superRefine((value, ctx) => {
      if (value == null) {
        if (options.required) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${options.label} is required` });
        }
        return;
      }

      if (!PNG_JPEG_TYPES.has(value.type)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${options.label} must be PNG or JPG`,
        });
      }

      if (value.size > options.maxBytes) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${options.label} must be ${maxMb}MB or smaller`,
        });
      }
    });
}

function optionalHttpUrl(label: string) {
  return z
    .string()
    .trim()
    .max(200, `${label} is too long`)
    .refine((value) => {
      if (value.length === 0) return true;
      try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    }, `Enter a valid ${label.toLowerCase()} URL`);
}

export const sellerRegisterSchema = z.object({
  businessName: requiredText('Business name', 120),
  businessType: z.string().min(1, 'Business type is required'),
  legalBusinessName: requiredText('Legal business name', 160),
  identityNumber: identityNumber('CCCD / passport number'),
  businessLicenseNumber: requiredText('Business registration certificate (GPKD)', 40),
  taxId: requiredText('Tax code (MST)', 40),
  legalRepresentativeName: requiredText('Legal representative name', 120),
  legalRepresentativeId: identityNumber('Legal representative CCCD'),
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
  shopName: requiredText('Shop name', SHOP_NAME_MAX_LENGTH).refine(
    (value) => toShopSlug(value).length > 0,
    { message: 'Use at least one letter or number in the shop name' },
  ),
  shopSlug: z
    .string()
    .trim()
    .min(1, 'Shop URL is required')
    .max(80, 'Shop URL is too long')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens'),
  shopCategory: z.string().min(1, 'Shop category is required'),
  shopDescription: requiredText('Shop description', SHOP_DESCRIPTION_MAX_LENGTH),
  shopLogo: imageFileSchema({
    label: 'Shop logo',
    maxBytes: SHOP_LOGO_MAX_BYTES,
    required: true,
  }),
  shopBanner: imageFileSchema({
    label: 'Shop banner',
    maxBytes: SHOP_BANNER_MAX_BYTES,
    required: false,
  }),
  facebookUrl: optionalHttpUrl('Facebook page'),
  instagramUrl: optionalHttpUrl('Instagram'),
  websiteUrl: optionalHttpUrl('Website'),
  documentType: z.string().min(1, 'Document type is required'),
  documentNumber: requiredText('Document number', 80),
});

export type SellerRegisterFormValues = z.infer<typeof sellerRegisterSchema>;

export const SELLER_BUSINESS_FIELDS = [
  'businessName',
  'businessType',
  'legalBusinessName',
  'identityNumber',
  'businessLicenseNumber',
  'taxId',
  'legalRepresentativeName',
  'legalRepresentativeId',
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
  'shopLogo',
  'shopBanner',
  'facebookUrl',
  'instagramUrl',
  'websiteUrl',
] as const satisfies readonly (keyof SellerRegisterFormValues)[];

export const SELLER_VERIFICATION_FIELDS = [
  'documentType',
  'documentNumber',
] as const satisfies readonly (keyof SellerRegisterFormValues)[];
