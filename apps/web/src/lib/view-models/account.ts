export const ACCOUNT_SECTIONS = [
  'overview',
  'orders',
  'addresses',
  'payment',
  'wishlist',
  'profile',
  'notifications',
  'security',
  'help',
] as const;

export type AccountSection = (typeof ACCOUNT_SECTIONS)[number];

export type AccountOrderStatus = 'Delivered' | 'Shipped' | 'Processing';

export interface AccountProfileViewModel {
  readonly name: string;
  readonly email: string;
  readonly membershipLabel: string;
  readonly membershipNote: string;
  readonly verified: boolean;
}

export interface AccountStatViewModel {
  readonly id: 'orders' | 'spent' | 'points';
  readonly value: string;
  readonly label: string;
}

export interface AccountQuickActionViewModel {
  readonly section: Extract<AccountSection, 'orders' | 'addresses' | 'payment' | 'wishlist'>;
  readonly title: string;
  readonly note: string;
  readonly tone: 'brand' | 'success' | 'rose';
}

export interface AccountOrderViewModel {
  readonly id: string;
  readonly date: string;
  readonly itemCount: number;
  readonly total: string;
  readonly status: AccountOrderStatus;
  readonly shape: 'headphones' | 'laptop' | 'watch' | 'sneaker';
}

export interface AccountAddressViewModel {
  readonly id: string;
  readonly label: string;
  readonly recipient: string;
  readonly line1: string;
  readonly line2: string;
}

export interface AccountPaymentMethodViewModel {
  readonly id: string;
  readonly brand: 'visa' | 'mastercard';
  readonly last4: string;
  readonly expires: string;
  readonly isDefault: boolean;
}

export const ACCOUNT_SECTION_LABELS: Record<AccountSection, string> = {
  overview: 'Overview',
  orders: 'Orders',
  addresses: 'Addresses',
  payment: 'Payment Methods',
  wishlist: 'Wishlist',
  profile: 'Profile Settings',
  notifications: 'Notifications',
  security: 'Security',
  help: 'Help & Support',
};

export function accountSectionHref(section: AccountSection): string {
  return section === 'overview' ? '/account' : `/account?section=${section}`;
}

export function isAccountSection(value: string | undefined): value is AccountSection {
  return ACCOUNT_SECTIONS.some((section) => section === value);
}
