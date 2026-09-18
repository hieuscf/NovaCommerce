/**
 * Presentation fixtures for Admin Order Management until an Order
 * Gateway adapter exists for the admin console.
 */

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';
export type OrderSource = 'Online' | 'Marketplace' | 'Offline';

export interface OrderKpi {
  id: string;
  label: string;
  value: string;
  change: string;
  changeLabel: string;
  tone: 'primary' | 'success' | 'warning' | 'destructive' | 'muted';
}

export interface OrderItemThumb {
  id: string;
  initials: string;
  accent: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  source: OrderSource;
  customerName: string;
  customerEmail: string;
  customerInitials: string;
  customerAccent: string;
  items: OrderItemThumb[];
  itemCount: number;
  totalAmount: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
}

export const ordersPageMeta = {
  title: 'Orders',
  description:
    'Manage and track all orders from your customers. Monitor status, payments and delivery progress.',
  breadcrumb: [
    { label: 'Home', href: '/' as string | undefined },
    { label: 'Orders', href: undefined as string | undefined },
  ],
};

export const orderKpis: OrderKpi[] = [
  {
    id: 'total',
    label: 'Total Orders',
    value: '2,458',
    change: '+12.5%',
    changeLabel: 'vs last 30 days',
    tone: 'primary',
  },
  {
    id: 'revenue',
    label: 'Total Revenue',
    value: '$245,830',
    change: '+18.2%',
    changeLabel: 'vs last 30 days',
    tone: 'success',
  },
  {
    id: 'pending',
    label: 'Pending Orders',
    value: '156',
    change: '+8.7%',
    changeLabel: 'vs last 30 days',
    tone: 'warning',
  },
  {
    id: 'delivered',
    label: 'Delivered Orders',
    value: '1,982',
    change: '+16.3%',
    changeLabel: 'vs last 30 days',
    tone: 'muted',
  },
];

export const adminOrders: AdminOrder[] = [
  {
    id: 'ord_1245',
    orderNumber: 'ORD-2025-001245',
    source: 'Online',
    customerName: 'Emma Wilson',
    customerEmail: 'emma.wilson@email.com',
    customerInitials: 'EW',
    customerAccent: '#6366F1',
    items: [
      { id: 'i1', initials: 'AP', accent: '#6366F1' },
      { id: 'i2', initials: 'CS', accent: '#0EA5E9' },
      { id: 'i3', initials: 'CH', accent: '#22C55E' },
    ],
    itemCount: 3,
    totalAmount: '$249.00',
    paymentStatus: 'paid',
    orderStatus: 'processing',
    createdAt: 'Sep 22, 2025 10:24 AM',
  },
  {
    id: 'ord_1244',
    orderNumber: 'ORD-2025-001244',
    source: 'Marketplace',
    customerName: 'James Brown',
    customerEmail: 'james.b@email.com',
    customerInitials: 'JB',
    customerAccent: '#8B5CF6',
    items: [
      { id: 'i1', initials: 'NK', accent: '#111827' },
      { id: 'i2', initials: 'AD', accent: '#EF4444' },
    ],
    itemCount: 2,
    totalAmount: '$189.50',
    paymentStatus: 'paid',
    orderStatus: 'shipped',
    createdAt: 'Sep 22, 2025 09:15 AM',
  },
  {
    id: 'ord_1243',
    orderNumber: 'ORD-2025-001243',
    source: 'Online',
    customerName: 'Sophia Martinez',
    customerEmail: 'sophia.m@email.com',
    customerInitials: 'SM',
    customerAccent: '#EC4899',
    items: [{ id: 'i1', initials: 'MB', accent: '#8B5CF6' }],
    itemCount: 1,
    totalAmount: '$1,099.00',
    paymentStatus: 'pending',
    orderStatus: 'pending',
    createdAt: 'Sep 21, 2025 04:42 PM',
  },
  {
    id: 'ord_1242',
    orderNumber: 'ORD-2025-001242',
    source: 'Offline',
    customerName: 'Liam Anderson',
    customerEmail: 'liam.a@email.com',
    customerInitials: 'LA',
    customerAccent: '#0EA5E9',
    items: [
      { id: 'i1', initials: 'DY', accent: '#A855F7' },
      { id: 'i2', initials: 'IK', accent: '#F59E0B' },
      { id: 'i3', initials: 'LR', accent: '#EC4899' },
      { id: 'i4', initials: 'SN', accent: '#64748B' },
    ],
    itemCount: 4,
    totalAmount: '$982.48',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    createdAt: 'Sep 21, 2025 02:18 PM',
  },
  {
    id: 'ord_1241',
    orderNumber: 'ORD-2025-001241',
    source: 'Online',
    customerName: 'Olivia Taylor',
    customerEmail: 'olivia.t@email.com',
    customerInitials: 'OT',
    customerAccent: '#22C55E',
    items: [
      { id: 'i1', initials: 'SG', accent: '#0EA5E9' },
      { id: 'i2', initials: 'GB', accent: '#14B8A6' },
    ],
    itemCount: 2,
    totalAmount: '$478.00',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    createdAt: 'Sep 21, 2025 11:05 AM',
  },
  {
    id: 'ord_1240',
    orderNumber: 'ORD-2025-001240',
    source: 'Marketplace',
    customerName: 'Noah Patel',
    customerEmail: 'noah.p@email.com',
    customerInitials: 'NP',
    customerAccent: '#F59E0B',
    items: [{ id: 'i1', initials: 'AP', accent: '#6366F1' }],
    itemCount: 1,
    totalAmount: '$249.00',
    paymentStatus: 'failed',
    orderStatus: 'cancelled',
    createdAt: 'Sep 20, 2025 08:33 PM',
  },
  {
    id: 'ord_1239',
    orderNumber: 'ORD-2025-001239',
    source: 'Online',
    customerName: 'Ava Chen',
    customerEmail: 'ava.chen@email.com',
    customerInitials: 'AC',
    customerAccent: '#14B8A6',
    items: [
      { id: 'i1', initials: 'SN', accent: '#64748B' },
      { id: 'i2', initials: 'CS', accent: '#0EA5E9' },
      { id: 'i3', initials: 'CH', accent: '#22C55E' },
    ],
    itemCount: 5,
    totalAmount: '$612.75',
    paymentStatus: 'paid',
    orderStatus: 'shipped',
    createdAt: 'Sep 20, 2025 03:12 PM',
  },
  {
    id: 'ord_1238',
    orderNumber: 'ORD-2025-001238',
    source: 'Online',
    customerName: 'Mason Lee',
    customerEmail: 'mason.lee@email.com',
    customerInitials: 'ML',
    customerAccent: '#A855F7',
    items: [
      { id: 'i1', initials: 'NK', accent: '#111827' },
      { id: 'i2', initials: 'AD', accent: '#EF4444' },
    ],
    itemCount: 2,
    totalAmount: '$290.00',
    paymentStatus: 'refunded',
    orderStatus: 'cancelled',
    createdAt: 'Sep 19, 2025 06:50 PM',
  },
  {
    id: 'ord_1237',
    orderNumber: 'ORD-2025-001237',
    source: 'Marketplace',
    customerName: 'Isabella Garcia',
    customerEmail: 'isabella.g@email.com',
    customerInitials: 'IG',
    customerAccent: '#EF4444',
    items: [
      { id: 'i1', initials: 'LR', accent: '#EC4899' },
      { id: 'i2', initials: 'IK', accent: '#F59E0B' },
      { id: 'i3', initials: 'DY', accent: '#A855F7' },
    ],
    itemCount: 3,
    totalAmount: '$981.98',
    paymentStatus: 'paid',
    orderStatus: 'processing',
    createdAt: 'Sep 19, 2025 01:27 PM',
  },
  {
    id: 'ord_1236',
    orderNumber: 'ORD-2025-001236',
    source: 'Offline',
    customerName: 'Ethan Kim',
    customerEmail: 'ethan.kim@email.com',
    customerInitials: 'EK',
    customerAccent: '#64748B',
    items: [{ id: 'i1', initials: 'MB', accent: '#8B5CF6' }],
    itemCount: 1,
    totalAmount: '$1,099.00',
    paymentStatus: 'pending',
    orderStatus: 'pending',
    createdAt: 'Sep 18, 2025 10:08 AM',
  },
];

export const ORDER_PAGE_SIZE = 10;
export const ORDER_TOTAL_COUNT = 2458;
export const ORDER_TOTAL_PAGES = 246;

export const orderStatusLabel: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  paid: 'Paid',
  pending: 'Pending',
  failed: 'Failed',
  refunded: 'Refunded',
};

export function filterOrders(
  orders: AdminOrder[],
  query: {
    q?: string;
    status?: OrderStatus | 'all';
    payment?: PaymentStatus | 'all';
  },
): AdminOrder[] {
  const q = query.q?.trim().toLowerCase();
  return orders.filter((order) => {
    if (query.status && query.status !== 'all' && order.orderStatus !== query.status) {
      return false;
    }
    if (query.payment && query.payment !== 'all' && order.paymentStatus !== query.payment) {
      return false;
    }
    if (!q) return true;
    return (
      order.orderNumber.toLowerCase().includes(q) ||
      order.id.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerEmail.toLowerCase().includes(q) ||
      order.source.toLowerCase().includes(q)
    );
  });
}
