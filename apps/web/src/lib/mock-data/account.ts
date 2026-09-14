import type {
  AccountAddressViewModel,
  AccountOrderViewModel,
  AccountPaymentMethodViewModel,
  AccountProfileViewModel,
  AccountQuickActionViewModel,
  AccountStatViewModel,
} from '@/lib/view-models/account';

/**
 * Presentation fixtures for the Alloy account dashboard.
 * Replace with User / Order Gateway adapters when those contracts are wired.
 * Do not treat these values as authenticated session data.
 */
export const accountProfile: AccountProfileViewModel = {
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  membershipLabel: 'NovaPrime Member',
  membershipNote: "You're enjoying premium benefits!",
  verified: true,
};

export const accountStats: readonly AccountStatViewModel[] = [
  { id: 'orders', value: '12', label: 'Total Orders' },
  { id: 'spent', value: '$2,480', label: 'Total Spent' },
  { id: 'points', value: '500', label: 'Loyalty Points' },
];

export const accountQuickActions: readonly AccountQuickActionViewModel[] = [
  { section: 'orders', title: 'View Orders', note: 'Track your orders', tone: 'brand' },
  { section: 'addresses', title: 'Manage Addresses', note: 'Delivery locations', tone: 'brand' },
  { section: 'payment', title: 'Payment Methods', note: 'Cards & wallets', tone: 'success' },
  { section: 'wishlist', title: 'Wishlist', note: 'Your favorite items', tone: 'rose' },
];

export const accountOrders: readonly AccountOrderViewModel[] = [
  {
    id: '#NC2026001',
    date: 'Sep 12, 2026',
    itemCount: 2,
    total: '$299.00',
    status: 'Delivered',
    shape: 'headphones',
  },
  {
    id: '#NC2026002',
    date: 'Sep 8, 2026',
    itemCount: 1,
    total: '$1,299.00',
    status: 'Shipped',
    shape: 'laptop',
  },
  {
    id: '#NC2026003',
    date: 'Sep 5, 2026',
    itemCount: 3,
    total: '$449.00',
    status: 'Processing',
    shape: 'watch',
  },
  {
    id: '#NC2026004',
    date: 'Aug 28, 2026',
    itemCount: 1,
    total: '$89.00',
    status: 'Delivered',
    shape: 'sneaker',
  },
];

export const accountAddresses: readonly AccountAddressViewModel[] = [
  {
    id: 'home',
    label: 'Home',
    recipient: 'Alex Johnson',
    line1: '123 Tech Street, District 1',
    line2: 'Ho Chi Minh City, Vietnam 700000',
  },
];

export const accountPaymentMethods: readonly AccountPaymentMethodViewModel[] = [
  { id: 'visa-4242', brand: 'visa', last4: '4242', expires: '12/28', isDefault: true },
  { id: 'mc-8888', brand: 'mastercard', last4: '8888', expires: '06/27', isDefault: false },
];

export const accountLoyaltyPoints = 500;
