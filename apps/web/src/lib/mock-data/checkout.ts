import type {
  CheckoutCustomerViewModel,
  CheckoutOptionViewModel,
  CheckoutPaymentMethodViewModel,
  CheckoutShippingViewModel,
} from '@/lib/view-models/checkout';

/**
 * Presentation fixtures for the Alloy checkout until User / Checkout
 * Gateway adapters are wired. Do not treat these as session or order data.
 */
export const checkoutCustomerFixture: CheckoutCustomerViewModel = {
  fullName: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  phone: '+84 912 345 678',
  createAccount: true,
};

export const checkoutShippingFixture: CheckoutShippingViewModel = {
  addressLine1: '123 Tech Street',
  addressLine2: '',
  city: 'Ho Chi Minh City',
  state: 'HCM',
  postalCode: '700000',
  country: 'VN',
};

export const checkoutPaymentMethods: readonly CheckoutPaymentMethodViewModel[] = [
  {
    id: 'card',
    label: 'Credit / Debit Card',
    description: 'Visa, Mastercard, JCB, AMEX',
    networks: ['visa', 'mastercard', 'jcb', 'amex'],
  },
  {
    id: 'paypal',
    label: 'PayPal',
    description: 'Pay with your PayPal account',
  },
  {
    id: 'qr_pay',
    label: 'QR Pay',
    description: 'Scan to pay with your banking app',
  },
  {
    id: 'google_pay',
    label: 'Google Pay',
    description: 'Pay with Google Pay',
  },
];

export const checkoutCountries: readonly CheckoutOptionViewModel[] = [
  { value: 'VN', label: 'Vietnam' },
  { value: 'US', label: 'United States' },
  { value: 'SG', label: 'Singapore' },
];

export const checkoutRegionsByCountry: Readonly<
  Record<string, readonly CheckoutOptionViewModel[]>
> = {
  VN: [
    { value: 'HCM', label: 'Ho Chi Minh City' },
    { value: 'HN', label: 'Hanoi' },
    { value: 'DN', label: 'Da Nang' },
  ],
  US: [
    { value: 'CA', label: 'California' },
    { value: 'NY', label: 'New York' },
    { value: 'WA', label: 'Washington' },
  ],
  SG: [{ value: 'SG', label: 'Singapore' }],
};
