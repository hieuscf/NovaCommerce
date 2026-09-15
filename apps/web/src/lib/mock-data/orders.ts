import type {
  OrderAddressViewModel,
  OrderListStatus,
  OrderPaymentViewModel,
  OrderShipmentViewModel,
  OrderSummaryViewModel,
  OrderTimelineStepViewModel,
} from '@/lib/view-models/order';

/**
 * Presentation fixtures for Alloy order pages until Order Gateway adapters
 * are wired. Line names/images come from the catalog. Totals are snapshots,
 * not live checkout math. Do not treat these as authenticated order data.
 */
export interface OrderFixtureLine {
  readonly productId: string;
  readonly quantity: number;
  readonly variantLabel: string;
  readonly unitPrice: number;
}

export interface OrderFixture {
  readonly orderNumber: string;
  readonly placedAtLabel: string;
  readonly status: OrderListStatus;
  readonly shape: 'headphones' | 'laptop' | 'watch' | 'sneaker' | 'backpack';
  readonly payment: OrderPaymentViewModel;
  readonly shipping: OrderShipmentViewModel;
  readonly address: OrderAddressViewModel;
  readonly lines: readonly OrderFixtureLine[];
  readonly timeline: readonly OrderTimelineStepViewModel[];
  readonly summary?: Omit<OrderSummaryViewModel, 'itemCount' | 'currency'> & {
    readonly currency?: string;
  };
}

const ALEX_HOME: OrderAddressViewModel = {
  recipient: 'Alex Johnson',
  line1: '123 Tech Street, District 1',
  line2: 'Ho Chi Minh City, Vietnam 700000',
  phone: '+84 912 345 678',
};

const VISA_PAID: OrderPaymentViewModel = {
  brand: 'Visa',
  last4: '4242',
  paidAtLabel: 'Paid on Sep 12, 10:42 AM',
  status: 'paid',
};

export const CONFIRMED_ORDER_NUMBER = 'NC2026001';

export const orderFixtures: readonly OrderFixture[] = [
  {
    orderNumber: CONFIRMED_ORDER_NUMBER,
    placedAtLabel: 'Sep 12, 2026 • 10:42 AM',
    status: 'shipped',
    shape: 'laptop',
    payment: VISA_PAID,
    shipping: {
      methodLabel: 'Standard Shipping (3–5 days)',
      trackingNumber: 'TRK946285731',
      carrier: 'FedEx',
    },
    address: ALEX_HOME,
    lines: [
      {
        productId: 'p-macbook-air',
        quantity: 1,
        variantLabel: 'Space Gray · Qty 1',
        unitPrice: 899,
      },
      {
        productId: 'p-sony-xm5',
        quantity: 1,
        variantLabel: 'Gray · Qty 1',
        unitPrice: 279,
      },
      {
        productId: 'p-watch-10',
        quantity: 1,
        variantLabel: '46mm Midnight + Black Band · Qty 1',
        unitPrice: 439,
      },
    ],
    summary: {
      subtotal: 1707,
      shipping: 0,
      tax: 136.56,
      total: 1843.56,
      taxRatePercent: 8,
    },
    timeline: [
      {
        id: 'confirmed',
        label: 'Order Confirmed',
        atLabel: 'Sep 12, 10:42 AM',
        state: 'complete',
      },
      {
        id: 'processing',
        label: 'Processing',
        atLabel: 'Sep 12, 11:15 AM',
        state: 'complete',
      },
      {
        id: 'shipped',
        label: 'Shipped',
        atLabel: 'Sep 13, 09:20 AM',
        note: 'Your order is on the way',
        state: 'current',
      },
      {
        id: 'out_for_delivery',
        label: 'Out for Delivery',
        note: 'Pending',
        state: 'pending',
      },
      {
        id: 'delivered',
        label: 'Delivered',
        note: 'Pending',
        state: 'pending',
      },
    ],
  },
  {
    orderNumber: 'NC2026002',
    placedAtLabel: 'Sep 5, 2026',
    status: 'delivered',
    shape: 'headphones',
    payment: {
      brand: 'Visa',
      last4: '4242',
      paidAtLabel: 'Paid on Sep 5, 09:18 AM',
      status: 'paid',
    },
    shipping: {
      methodLabel: 'Standard Shipping (3–5 days)',
      trackingNumber: 'TRK883102447',
      carrier: 'FedEx',
    },
    address: ALEX_HOME,
    lines: [
      { productId: 'p-iphone-17-pro', quantity: 1, variantLabel: '256GB · Natural Titanium', unitPrice: 1199 },
      { productId: 'p-airpods', quantity: 1, variantLabel: 'USB-C · White', unitPrice: 100 },
    ],
    summary: {
      subtotal: 1199,
      shipping: 0,
      tax: 100,
      total: 1299,
      taxRatePercent: 8,
    },
    timeline: deliveredTimeline('Sep 5, 09:18 AM', 'Sep 6, 02:40 PM', 'Sep 8, 11:05 AM'),
  },
  {
    orderNumber: 'NC2026003',
    placedAtLabel: 'Aug 28, 2026',
    status: 'processing',
    shape: 'watch',
    payment: {
      brand: 'Mastercard',
      last4: '8888',
      paidAtLabel: 'Paid on Aug 28, 04:12 PM',
      status: 'paid',
    },
    shipping: {
      methodLabel: 'Standard Shipping (3–5 days)',
    },
    address: ALEX_HOME,
    lines: [
      { productId: 'p-watch-10', quantity: 1, variantLabel: 'GPS · 46mm · Black', unitPrice: 429 },
    ],
    summary: {
      subtotal: 415.74,
      shipping: 0,
      tax: 33.26,
      total: 449,
      taxRatePercent: 8,
    },
    timeline: processingTimeline('Aug 28, 04:12 PM', 'Aug 28, 04:40 PM'),
  },
  {
    orderNumber: 'NC2026004',
    placedAtLabel: 'Aug 20, 2026',
    status: 'delivered',
    shape: 'sneaker',
    payment: {
      brand: 'Visa',
      last4: '4242',
      paidAtLabel: 'Paid on Aug 20, 08:02 AM',
      status: 'paid',
    },
    shipping: {
      methodLabel: 'Standard Shipping (3–5 days)',
      trackingNumber: 'TRK552019883',
      carrier: 'FedEx',
    },
    address: ALEX_HOME,
    lines: [
      { productId: 'p-air-force', quantity: 1, variantLabel: "Men's Shoes · White", unitPrice: 59 },
      { productId: 'p-hub', quantity: 1, variantLabel: '7-in-1', unitPrice: 30 },
    ],
    summary: {
      subtotal: 82.41,
      shipping: 0,
      tax: 6.59,
      total: 89,
      taxRatePercent: 8,
    },
    timeline: deliveredTimeline('Aug 20, 08:02 AM', 'Aug 21, 10:15 AM', 'Aug 23, 03:20 PM'),
  },
  {
    orderNumber: 'NC2026005',
    placedAtLabel: 'Aug 15, 2026',
    status: 'delivered',
    shape: 'backpack',
    payment: {
      brand: 'Visa',
      last4: '4242',
      paidAtLabel: 'Paid on Aug 15, 07:44 PM',
      status: 'paid',
    },
    shipping: {
      methodLabel: 'Standard Shipping (3–5 days)',
      trackingNumber: 'TRK441902776',
      carrier: 'FedEx',
    },
    address: ALEX_HOME,
    lines: [
      { productId: 'p-backpack', quantity: 1, variantLabel: 'Outdoor · 28L · Black', unitPrice: 89 },
      { productId: 'p-hub', quantity: 1, variantLabel: '7-in-1', unitPrice: 59 },
      { productId: 'p-earbuds-budget', quantity: 1, variantLabel: 'Black', unitPrice: 79 },
    ],
    summary: {
      subtotal: 647.22,
      shipping: 0,
      tax: 51.78,
      total: 699,
      taxRatePercent: 8,
    },
    timeline: deliveredTimeline('Aug 15, 07:44 PM', 'Aug 16, 09:10 AM', 'Aug 18, 01:05 PM'),
  },
  {
    orderNumber: 'NC2026006',
    placedAtLabel: 'Aug 8, 2026',
    status: 'delivered',
    shape: 'headphones',
    payment: {
      brand: 'Visa',
      last4: '4242',
      paidAtLabel: 'Paid on Aug 8, 11:22 AM',
      status: 'paid',
    },
    shipping: {
      methodLabel: 'Standard Shipping (3–5 days)',
      trackingNumber: 'TRK330881221',
      carrier: 'FedEx',
    },
    address: ALEX_HOME,
    lines: [
      { productId: 'p-sony-xm5', quantity: 2, variantLabel: 'Silver · Wireless', unitPrice: 279 },
    ],
    timeline: deliveredTimeline('Aug 8, 11:22 AM', 'Aug 9, 08:30 AM', 'Aug 11, 04:15 PM'),
  },
  {
    orderNumber: 'NC2026007',
    placedAtLabel: 'Jul 30, 2026',
    status: 'cancelled',
    shape: 'laptop',
    payment: {
      brand: 'Visa',
      last4: '4242',
      paidAtLabel: 'Refunded Jul 30, 02:18 PM',
      status: 'pending',
    },
    shipping: {
      methodLabel: 'Standard Shipping (3–5 days)',
    },
    address: ALEX_HOME,
    lines: [
      { productId: 'p-macbook-air', quantity: 1, variantLabel: 'Space Gray · 256GB', unitPrice: 999 },
    ],
    timeline: [
      {
        id: 'confirmed',
        label: 'Order Confirmed',
        atLabel: 'Jul 30, 01:40 PM',
        state: 'complete',
      },
      {
        id: 'processing',
        label: 'Cancelled',
        atLabel: 'Jul 30, 02:18 PM',
        note: 'This order was cancelled',
        state: 'current',
      },
      { id: 'shipped', label: 'Shipped', note: 'Pending', state: 'pending' },
      { id: 'out_for_delivery', label: 'Out for Delivery', note: 'Pending', state: 'pending' },
      { id: 'delivered', label: 'Delivered', note: 'Pending', state: 'pending' },
    ],
  },
  {
    orderNumber: 'NC2026008',
    placedAtLabel: 'Jul 22, 2026',
    status: 'shipped',
    shape: 'watch',
    payment: {
      brand: 'Mastercard',
      last4: '8888',
      paidAtLabel: 'Paid on Jul 22, 06:05 PM',
      status: 'paid',
    },
    shipping: {
      methodLabel: 'Express Shipping (1–2 days)',
      trackingNumber: 'TRK229100554',
      carrier: 'FedEx',
    },
    address: ALEX_HOME,
    lines: [
      { productId: 'p-airpods', quantity: 1, variantLabel: 'USB-C · White', unitPrice: 249 },
      { productId: 'p-watch-10', quantity: 1, variantLabel: 'GPS · 46mm · Black', unitPrice: 429 },
    ],
    timeline: [
      {
        id: 'confirmed',
        label: 'Order Confirmed',
        atLabel: 'Jul 22, 06:05 PM',
        state: 'complete',
      },
      {
        id: 'processing',
        label: 'Processing',
        atLabel: 'Jul 22, 06:40 PM',
        state: 'complete',
      },
      {
        id: 'shipped',
        label: 'Shipped',
        atLabel: 'Jul 23, 08:12 AM',
        note: 'Your order is on the way',
        state: 'current',
      },
      { id: 'out_for_delivery', label: 'Out for Delivery', note: 'Pending', state: 'pending' },
      { id: 'delivered', label: 'Delivered', note: 'Pending', state: 'pending' },
    ],
  },
  {
    orderNumber: 'NC2026009',
    placedAtLabel: 'Jul 14, 2026',
    status: 'processing',
    shape: 'sneaker',
    payment: {
      brand: 'Visa',
      last4: '4242',
      paidAtLabel: 'Paid on Jul 14, 10:08 AM',
      status: 'paid',
    },
    shipping: {
      methodLabel: 'Standard Shipping (3–5 days)',
    },
    address: ALEX_HOME,
    lines: [
      { productId: 'p-air-force', quantity: 1, variantLabel: "Men's Shoes · White", unitPrice: 119 },
      { productId: 'p-backpack', quantity: 1, variantLabel: 'Outdoor · 28L · Black', unitPrice: 89 },
    ],
    timeline: processingTimeline('Jul 14, 10:08 AM', 'Jul 14, 10:30 AM'),
  },
];

function processingTimeline(
  confirmedAt: string,
  processingAt: string,
): readonly OrderTimelineStepViewModel[] {
  return [
    { id: 'confirmed', label: 'Order Confirmed', atLabel: confirmedAt, state: 'complete' },
    {
      id: 'processing',
      label: 'Processing',
      atLabel: processingAt,
      note: 'We are preparing your items',
      state: 'current',
    },
    { id: 'shipped', label: 'Shipped', note: 'Pending', state: 'pending' },
    { id: 'out_for_delivery', label: 'Out for Delivery', note: 'Pending', state: 'pending' },
    { id: 'delivered', label: 'Delivered', note: 'Pending', state: 'pending' },
  ];
}

function deliveredTimeline(
  confirmedAt: string,
  shippedAt: string,
  deliveredAt: string,
): readonly OrderTimelineStepViewModel[] {
  return [
    { id: 'confirmed', label: 'Order Confirmed', atLabel: confirmedAt, state: 'complete' },
    { id: 'processing', label: 'Processing', atLabel: confirmedAt, state: 'complete' },
    { id: 'shipped', label: 'Shipped', atLabel: shippedAt, state: 'complete' },
    { id: 'out_for_delivery', label: 'Out for Delivery', atLabel: shippedAt, state: 'complete' },
    {
      id: 'delivered',
      label: 'Delivered',
      atLabel: deliveredAt,
      note: 'Package delivered',
      state: 'complete',
    },
  ];
}

export const orderConfirmedProgress: readonly OrderTimelineStepViewModel[] = [
  { id: 'confirmed', label: 'Confirmed', state: 'complete' },
  { id: 'processing', label: 'Processing', note: 'Pending', state: 'current' },
  { id: 'shipped', label: 'Shipped', note: 'Pending', state: 'pending' },
  { id: 'delivered', label: 'Delivered', note: 'Pending', state: 'pending' },
];
