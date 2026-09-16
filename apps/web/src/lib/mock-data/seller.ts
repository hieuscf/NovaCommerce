import type {
  SellerDialCodeViewModel,
  SellerOptionViewModel,
  SellerSellingModelViewModel,
  SellerVerificationDocumentViewModel,
} from '@/lib/view-models/seller';

/**
 * Presentation fixtures for seller onboarding until the Seller module
 * has Gateway adapters. Do not treat these as domain enums.
 */
export const sellerBusinessTypes: readonly SellerOptionViewModel[] = [
  { value: 'individual', label: 'Individual' },
  { value: 'sole_proprietor', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llc', label: 'Limited Liability Company' },
  { value: 'corporation', label: 'Corporation' },
];

export const sellerCities: readonly SellerOptionViewModel[] = [
  { value: 'hcmc', label: 'Ho Chi Minh City' },
  { value: 'hanoi', label: 'Hanoi' },
  { value: 'danang', label: 'Da Nang' },
  { value: 'haiphong', label: 'Hai Phong' },
  { value: 'cantho', label: 'Can Tho' },
];

export const sellerStates: readonly SellerOptionViewModel[] = [
  { value: 'HCM', label: 'Ho Chi Minh' },
  { value: 'HN', label: 'Hanoi' },
  { value: 'DN', label: 'Da Nang' },
  { value: 'HP', label: 'Hai Phong' },
  { value: 'CT', label: 'Can Tho' },
  { value: 'BD', label: 'Binh Duong' },
  { value: 'DNI', label: 'Dong Nai' },
];

export const sellerDialCodes: readonly SellerDialCodeViewModel[] = [
  { value: 'VN', label: 'Vietnam', dial: '+84' },
  { value: 'US', label: 'United States', dial: '+1' },
  { value: 'SG', label: 'Singapore', dial: '+65' },
];

export const sellerShopCategories: readonly SellerOptionViewModel[] = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'home', label: 'Home & Living' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'sports', label: 'Sports' },
  { value: 'other', label: 'Other' },
];

export const sellerSellingModels: readonly SellerSellingModelViewModel[] = [
  {
    value: 'retail',
    label: 'Regular retail',
    description: 'Sell directly to consumers (personal brands and small shops).',
  },
  {
    value: 'official',
    label: 'Official Store / Mall',
    description: 'Authorized brand distributor, importer, or authorized dealer.',
  },
  {
    value: 'manufacturer',
    label: 'Manufacturer',
    description: 'Factory, workshop, or products sold under your own brand.',
  },
];

export const sellerVerificationDocuments: readonly SellerVerificationDocumentViewModel[] = [
  {
    field: 'authorizationLetter',
    title: 'Brand distribution authorization',
    description: 'Required for Official Store / Mall and authorized distributors.',
    icon: 'authorization',
  },
  {
    field: 'qualityCertificate',
    title: 'Product quality / food safety certificate',
    description: 'Applies to cosmetics, supplements, and similar regulated goods.',
    icon: 'quality',
  },
  {
    field: 'originInvoice',
    title: 'Import invoice / origin document',
    description: 'Proof of product origin and how goods entered your catalog.',
    icon: 'origin',
  },
];
