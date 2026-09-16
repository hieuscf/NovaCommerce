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
  readonly phoneNumber?: string;
  readonly avatarUrl?: string;
  readonly membershipLabel: string;
  readonly membershipNote: string;
}

export interface AccountStatViewModel {
  readonly id: 'addresses' | 'preferences' | 'member';
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
  readonly line1: string;
  readonly line2?: string;
  readonly city: string;
  readonly state: string;
  readonly postalCode: string;
  readonly country: string;
  readonly isDefault: boolean;
  readonly formattedSecondary: string;
}

export interface AccountPaymentMethodViewModel {
  readonly id: string;
  readonly brand: 'visa' | 'mastercard' | 'amex' | 'jcb' | 'card';
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

export const ACCOUNT_QUICK_ACTIONS: readonly AccountQuickActionViewModel[] = [
  { section: 'orders', title: 'View Orders', note: 'Track your orders', tone: 'brand' },
  { section: 'addresses', title: 'Manage Addresses', note: 'Delivery locations', tone: 'brand' },
  { section: 'payment', title: 'Payment Methods', note: 'Cards & wallets', tone: 'success' },
  { section: 'wishlist', title: 'Wishlist', note: 'Your favorite items', tone: 'rose' },
];

export function accountSectionHref(section: AccountSection): string {
  if (section === 'orders') {
    return '/orders';
  }
  return section === 'overview' ? '/account' : `/account?section=${section}`;
}

export function isAccountSection(value: string | undefined): value is AccountSection {
  return ACCOUNT_SECTIONS.some((section) => section === value);
}
