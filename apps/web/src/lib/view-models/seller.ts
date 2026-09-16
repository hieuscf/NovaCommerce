export const SELLER_PAGE_STATUSES = ['unregistered', 'registered'] as const;

export type SellerPageStatus = (typeof SELLER_PAGE_STATUSES)[number];

export const SELLER_REGISTER_STEPS = [
  { id: 'business', number: 1, label: 'Business Information' },
  { id: 'shop', number: 2, label: 'Shop Details' },
  { id: 'verification', number: 3, label: 'Terms & Verification' },
  { id: 'complete', number: 4, label: 'Complete' },
] as const;

export type SellerRegisterStepId = (typeof SELLER_REGISTER_STEPS)[number]['id'];

export interface SellerOptionViewModel {
  readonly value: string;
  readonly label: string;
}

export interface SellerDialCodeViewModel extends SellerOptionViewModel {
  readonly dial: string;
}

export interface SellerPageViewModel {
  readonly status: SellerPageStatus;
  readonly businessTypes: readonly SellerOptionViewModel[];
  readonly cities: readonly SellerOptionViewModel[];
  readonly states: readonly SellerOptionViewModel[];
  readonly dialCodes: readonly SellerDialCodeViewModel[];
  readonly shopCategories: readonly SellerOptionViewModel[];
  readonly documentTypes: readonly SellerOptionViewModel[];
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
