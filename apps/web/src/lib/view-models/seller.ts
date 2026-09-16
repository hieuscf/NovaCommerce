export const SELLER_PAGE_STATUSES = ['unregistered', 'registered'] as const;

export type SellerPageStatus = (typeof SELLER_PAGE_STATUSES)[number];

export const SELLER_REGISTER_STEPS = [
  { id: 'business', number: 1, label: 'Business Information' },
  { id: 'shop', number: 2, label: 'Shop Details' },
  { id: 'verification', number: 3, label: 'Verification' },
  { id: 'terms', number: 4, label: 'Terms & Conditions' },
  { id: 'complete', number: 5, label: 'Complete' },
] as const;

export type SellerRegisterStepId = (typeof SELLER_REGISTER_STEPS)[number]['id'];

export interface SellerOptionViewModel {
  readonly value: string;
  readonly label: string;
}

export interface SellerDialCodeViewModel extends SellerOptionViewModel {
  readonly dial: string;
}

export interface SellerSellingModelViewModel {
  readonly value: string;
  readonly label: string;
  readonly description: string;
}

export const SELLER_DOCUMENT_ICONS = ['authorization', 'quality', 'origin'] as const;

export type SellerDocumentIcon = (typeof SELLER_DOCUMENT_ICONS)[number];

export interface SellerVerificationDocumentViewModel {
  readonly field: 'authorizationLetter' | 'qualityCertificate' | 'originInvoice';
  readonly title: string;
  readonly description: string;
  readonly icon: SellerDocumentIcon;
}

export interface SellerTermsClauseViewModel {
  readonly id: string;
  readonly label: string;
  readonly text?: string;
  readonly bullets?: readonly string[];
}

export interface SellerTermsSectionViewModel {
  readonly number: string;
  readonly title: string;
  readonly clauses: readonly SellerTermsClauseViewModel[];
}

export interface SellerPageViewModel {
  readonly status: SellerPageStatus;
  readonly businessTypes: readonly SellerOptionViewModel[];
  readonly cities: readonly SellerOptionViewModel[];
  readonly states: readonly SellerOptionViewModel[];
  readonly dialCodes: readonly SellerDialCodeViewModel[];
  readonly shopCategories: readonly SellerOptionViewModel[];
  readonly sellingModels: readonly SellerSellingModelViewModel[];
  readonly verificationDocuments: readonly SellerVerificationDocumentViewModel[];
  readonly termsSections: readonly SellerTermsSectionViewModel[];
}

export function isSellerRegisterStepComplete(
  stepId: SellerRegisterStepId,
  current: SellerRegisterStepId,
): boolean {
  const currentIndex = SELLER_REGISTER_STEPS.findIndex((step) => step.id === current);
  const stepIndex = SELLER_REGISTER_STEPS.findIndex((step) => step.id === stepId);
  return stepIndex >= 0 && currentIndex > stepIndex;
}

export function isSellerRegisterStepCurrent(
  stepId: SellerRegisterStepId,
  current: SellerRegisterStepId,
): boolean {
  return stepId === current;
}
