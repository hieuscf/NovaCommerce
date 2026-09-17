/**
 * Presentation fixtures for the Admin dashboard until reporting Gateway
 * adapters exist. Values mirror the Alloy admin mock — not live commerce data.
 */

export type OrderStatusTone = 'processing' | 'shipped' | 'pending' | 'delivered' | 'cancelled';

export interface DashboardKpi {
  id: string;
  label: string;
  value: string;
  change: string;
  changeLabel: string;
  tone: 'primary' | 'success' | 'warning' | 'destructive';
  sparkline: number[];
}

export interface SalesPoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface OrderStatusSlice {
  id: string;
  label: string;
  percent: number;
  color: string;
}

export interface RecentOrder {
  id: string;
  customer: string;
  amount: string;
  status: OrderStatusTone;
  date: string;
}

export interface TopProduct {
  rank: number;
  name: string;
  units: number;
  revenue: string;
  accent: string;
}

export interface CategorySale {
  id: string;
  label: string;
  percent: number;
  accent: string;
}

export const dashboardGreeting = {
  title: 'Good morning, Admin!',
  subtitle: "Here's what's happening with your store today.",
  dateRange: 'Sep 16, 2025 – Sep 22, 2025',
};

export const dashboardKpis: DashboardKpi[] = [
  {
    id: 'revenue',
    label: 'Total Revenue',
    value: '$12,845.32',
    change: '+12.5%',
    changeLabel: 'vs last week',
    tone: 'primary',
    sparkline: [42, 48, 45, 52, 58, 55, 68, 72, 70, 78, 85, 92],
  },
  {
    id: 'orders',
    label: 'Total Orders',
    value: '1,248',
    change: '+8.2%',
    changeLabel: 'vs last week',
    tone: 'success',
    sparkline: [30, 34, 32, 40, 38, 45, 48, 44, 52, 58, 55, 62],
  },
  {
    id: 'customers',
    label: 'New Customers',
    value: '432',
    change: '+15.3%',
    changeLabel: 'vs last week',
    tone: 'warning',
    sparkline: [20, 24, 28, 26, 32, 36, 34, 40, 44, 42, 48, 55],
  },
  {
    id: 'conversion',
    label: 'Conversion Rate',
    value: '3.24%',
    change: '+0.8%',
    changeLabel: 'vs last week',
    tone: 'destructive',
    sparkline: [28, 30, 29, 33, 31, 35, 38, 36, 40, 42, 41, 45],
  },
];

export const salesOverview: SalesPoint[] = [
  { label: 'Sep 16', revenue: 8200, orders: 9800 },
  { label: 'Sep 17', revenue: 12400, orders: 11200 },
  { label: 'Sep 18', revenue: 9800, orders: 14100 },
  { label: 'Sep 19', revenue: 15600, orders: 12800 },
  { label: 'Sep 20', revenue: 13200, orders: 16800 },
  { label: 'Sep 21', revenue: 18900, orders: 15200 },
  { label: 'Sep 22', revenue: 21400, orders: 18600 },
];

export const orderStatusSlices: OrderStatusSlice[] = [
  { id: 'pending', label: 'Pending', percent: 25.0, color: '#F59E0B' },
  { id: 'processing', label: 'Processing', percent: 23.9, color: '#3B82F6' },
  { id: 'shipped', label: 'Shipped', percent: 33.7, color: '#22C55E' },
  { id: 'delivered', label: 'Delivered', percent: 15.0, color: '#8B5CF6' },
  { id: 'cancelled', label: 'Cancelled', percent: 2.4, color: '#EF4444' },
];

export const orderStatusTotal = 1248;

export const recentOrders: RecentOrder[] = [
  {
    id: '#NVC-2847',
    customer: 'Sarah Johnson',
    amount: '$1,249.00',
    status: 'processing',
    date: 'Sep 22, 10:24 AM',
  },
  {
    id: '#NVC-2846',
    customer: 'Michael Chen',
    amount: '$89.99',
    status: 'shipped',
    date: 'Sep 22, 09:15 AM',
  },
  {
    id: '#NVC-2845',
    customer: 'Emily Davis',
    amount: '$456.50',
    status: 'pending',
    date: 'Sep 22, 08:42 AM',
  },
  {
    id: '#NVC-2844',
    customer: 'James Wilson',
    amount: '$2,199.00',
    status: 'delivered',
    date: 'Sep 21, 06:30 PM',
  },
  {
    id: '#NVC-2843',
    customer: 'Lisa Anderson',
    amount: '$159.00',
    status: 'shipped',
    date: 'Sep 21, 04:18 PM',
  },
];

export const topSellingProducts: TopProduct[] = [
  {
    rank: 1,
    name: 'MacBook Air M2',
    units: 156,
    revenue: '$187,044',
    accent: '#6366F1',
  },
  {
    rank: 2,
    name: 'Sony WH-1000XM5',
    units: 243,
    revenue: '$84,957',
    accent: '#0EA5E9',
  },
  {
    rank: 3,
    name: 'iPhone 15 Pro',
    units: 189,
    revenue: '$226,611',
    accent: '#64748B',
  },
  {
    rank: 4,
    name: 'Nike Air Max 90',
    units: 312,
    revenue: '$40,560',
    accent: '#F97316',
  },
  {
    rank: 5,
    name: 'Samsung Galaxy Watch',
    units: 178,
    revenue: '$53,222',
    accent: '#8B5CF6',
  },
];

export const salesByCategory: CategorySale[] = [
  { id: 'electronics', label: 'Electronics', percent: 42, accent: '#6366F1' },
  { id: 'fashion', label: 'Fashion', percent: 28, accent: '#EC4899' },
  { id: 'home', label: 'Home & Living', percent: 18, accent: '#22C55E' },
  { id: 'sports', label: 'Sports', percent: 8, accent: '#F59E0B' },
  { id: 'beauty', label: 'Beauty', percent: 4, accent: '#8B5CF6' },
];

export const orderStatusBadgeVariant: Record<
  OrderStatusTone,
  'info' | 'success' | 'warning' | 'secondary' | 'destructive'
> = {
  processing: 'info',
  shipped: 'success',
  pending: 'warning',
  delivered: 'secondary',
  cancelled: 'destructive',
};

export const orderStatusLabel: Record<OrderStatusTone, string> = {
  processing: 'Processing',
  shipped: 'Shipped',
  pending: 'Pending',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
