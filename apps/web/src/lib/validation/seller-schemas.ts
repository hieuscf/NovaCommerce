import { z } from 'zod';
import { emailSchema } from '@/lib/validation/auth-schemas';

export const SHOP_NAME_MAX_LENGTH = 50;
export const SHOP_DESCRIPTION_MAX_LENGTH = 500;
export const SHOP_LOGO_MAX_BYTES = 2 * 1024 * 1024;
export const SHOP_BANNER_MAX_BYTES = 5 * 1024 * 1024;
export const VERIFICATION_DOCUMENT_MAX_BYTES = 5 * 1024 * 1024;

const PNG_JPEG_TYPES = new Set(['image/png', 'image/jpeg']);
const PNG_JPEG_PDF_TYPES = new Set(['image/png', 'image/jpeg', 'application/pdf']);

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

function isUploadFile(value: unknown): value is File {
  return typeof File !== 'undefined' && value instanceof File;
}

function fileSchema(options: {
  label: string;
  maxBytes: number;
  required: boolean;
  allowedTypes: Set<string>;
  typeMessage: string;
}) {
  const maxMb = options.maxBytes / (1024 * 1024);

  return z
    .custom<File | null>((value) => value == null || isUploadFile(value))
    .superRefine((value, ctx) => {
      if (value == null) {
        if (options.required) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${options.label} is required` });
        }
        return;
      }

      if (!options.allowedTypes.has(value.type)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: options.typeMessage,
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

function imageFileSchema(options: { label: string; maxBytes: number; required: boolean }) {
  return fileSchema({
    ...options,
    allowedTypes: PNG_JPEG_TYPES,
    typeMessage: `${options.label} must be PNG or JPG`,
  });
}

function documentFileSchema(label: string) {
  return fileSchema({
    label,
    maxBytes: VERIFICATION_DOCUMENT_MAX_BYTES,
    required: false,
    allowedTypes: PNG_JPEG_PDF_TYPES,
    typeMessage: `${label} must be PDF, PNG, or JPG`,
  });
}

function requiredAccepted(message: string) {
  return z.boolean().refine((value) => value, message);
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
  identityNumber: identityNumber('National ID / passport number'),
  businessLicenseNumber: requiredText('Business registration certificate', 40),
  taxId: requiredText('Tax ID', 40),
  legalRepresentativeName: requiredText('Legal representative name', 120),
  legalRepresentativeId: identityNumber('Legal representative ID'),
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
  sellingModel: z.string().min(1, 'Business model is required'),
  authorizationLetter: documentFileSchema('Brand distribution authorization'),
  qualityCertificate: documentFileSchema('Product quality certificate'),
  originInvoice: documentFileSchema('Import invoice'),
  acceptTerms: requiredAccepted('You must accept the Terms of Service'),
  acceptSellerAgreement: requiredAccepted('You must accept the Seller Agreement'),
  acceptPrivacy: requiredAccepted('You must accept the Privacy Policy'),
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
  'sellingModel',
  'authorizationLetter',
  'qualityCertificate',
  'originInvoice',
] as const satisfies readonly (keyof SellerRegisterFormValues)[];

export const SELLER_TERMS_FIELDS = [
  'acceptTerms',
  'acceptSellerAgreement',
  'acceptPrivacy',
] as const satisfies readonly (keyof SellerRegisterFormValues)[];
