import type { CartLineViewModel, CartSummaryViewModel } from '@/lib/view-models/cart';
import type { ShopCrumb } from '@/lib/view-models/shop';

export const CHECKOUT_STEPS = [
  { id: 'information', number: 1, label: 'Information', description: 'Customer details' },
  { id: 'shipping', number: 2, label: 'Shipping', description: 'Delivery address' },
  { id: 'payment', number: 3, label: 'Payment', description: 'Payment method' },
  { id: 'review', number: 4, label: 'Review', description: 'Confirm order' },
] as const;

export type CheckoutStepId = (typeof CHECKOUT_STEPS)[number]['id'];

/** UI stage. Information + shipping share one screen to match the Alloy checkout. */
export type CheckoutStage = 'details' | 'payment' | 'review' | 'success';

/**
 * Gateway `CompleteCheckoutRequestDto.paymentProvider` values.
 * Keep in sync with that contract; do not invent extra providers here.
 */
export const CHECKOUT_PAYMENT_PROVIDERS = ['vnpay', 'momo', 'paypal'] as const;

export type CheckoutPaymentProvider = (typeof CHECKOUT_PAYMENT_PROVIDERS)[number];

/**
 * Alloy Payment Gateway tiles. Presentation-only until Checkout is wired.
 * Do not POST these ids as `paymentProvider` — map with `toCheckoutPaymentProvider`.
 */
export const CHECKOUT_PAYMENT_METHOD_IDS = ['card', 'paypal', 'qr_pay', 'google_pay'] as const;

export type CheckoutPaymentMethodId = (typeof CHECKOUT_PAYMENT_METHOD_IDS)[number];

export const CHECKOUT_PAYMENT_METHOD_PROVIDERS = {
  card: 'vnpay',
  paypal: 'paypal',
  qr_pay: 'vnpay',
  google_pay: 'momo',
} as const satisfies Record<CheckoutPaymentMethodId, CheckoutPaymentProvider>;

export function toCheckoutPaymentProvider(method: CheckoutPaymentMethodId): CheckoutPaymentProvider {
  return CHECKOUT_PAYMENT_METHOD_PROVIDERS[method];
}

export interface CheckoutOptionViewModel {
  readonly value: string;
  readonly label: string;
}

export interface CheckoutPaymentMethodViewModel {
  readonly id: CheckoutPaymentMethodId;
  readonly label: string;
  readonly description: string;
  readonly networks?: readonly string[];
}

export interface CheckoutCustomerViewModel {
  readonly fullName: string;
  readonly email: string;
  readonly phone: string;
  readonly createAccount: boolean;
}

export interface CheckoutShippingViewModel {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly city: string;
  readonly state: string;
  readonly postalCode: string;
  readonly country: string;
}

export interface CheckoutPageViewModel {
  readonly crumbs: readonly ShopCrumb[];
  readonly customer: CheckoutCustomerViewModel;
  readonly shipping: CheckoutShippingViewModel;
  readonly lines: readonly CartLineViewModel[];
  readonly summary: CartSummaryViewModel;
  readonly paymentMethods: readonly CheckoutPaymentMethodViewModel[];
  readonly countries: readonly CheckoutOptionViewModel[];
  readonly regionsByCountry: Readonly<Record<string, readonly CheckoutOptionViewModel[]>>;
}

export function checkoutCrumbsForStage(stage: CheckoutStage): readonly ShopCrumb[] {
  if (stage === 'payment') {
    return [
      { href: '/', label: 'Home' },
      { href: '/checkout', label: 'Checkout' },
      { href: '/checkout', label: 'Payment', current: true },
    ];
  }

  return [
    { href: '/', label: 'Home' },
    { href: '/checkout', label: 'Checkout', current: true },
  ];
}

export function checkoutStageForStep(stepId: CheckoutStepId): CheckoutStage {
  if (stepId === 'payment') return 'payment';
  if (stepId === 'review') return 'review';
  return 'details';
}

export function isCheckoutStepComplete(stepId: CheckoutStepId, stage: CheckoutStage): boolean {
  if (stage === 'success') return true;
  if (stepId === 'information') return stage === 'details' || stage === 'payment' || stage === 'review';
  if (stepId === 'shipping') return stage === 'payment' || stage === 'review';
  if (stepId === 'payment') return stage === 'review';
  return false;
}

export function isCheckoutStepCurrent(stepId: CheckoutStepId, stage: CheckoutStage): boolean {
  if (stage === 'success') return false;
  if (stage === 'details') return stepId === 'shipping';
  if (stage === 'payment') return stepId === 'payment';
  return stepId === 'review';
}

export function formatCheckoutAddress(
  shipping: CheckoutShippingViewModel,
  countries: readonly CheckoutOptionViewModel[],
  regions: readonly CheckoutOptionViewModel[],
): string {
  const country = countries.find((item) => item.value === shipping.country)?.label ?? shipping.country;
  const region = regions.find((item) => item.value === shipping.state)?.label ?? shipping.state;
  return [shipping.addressLine1, shipping.addressLine2, shipping.city, region, shipping.postalCode, country]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(', ');
}
