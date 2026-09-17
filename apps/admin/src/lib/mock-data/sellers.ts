/**
 * Presentation fixtures for Admin Seller Management until a Seller Gateway
 * adapter exists (Seller module is deferred in domain-model.md).
 */

export type SellerStatus = 'active' | 'pending' | 'suspended';

export interface SellerKpi {
  id: string;
  label: string;
  value: string;
  change: string;
  changeLabel: string;
  tone: 'primary' | 'success' | 'warning' | 'destructive' | 'info';
}

export interface AdminSeller {
  id: string;
  displayId: string;
  name: string;
  initials: string;
  accent: string;
  shopName: string;
  category: string;
  email: string;
  status: SellerStatus;
  verified: boolean;
  joinedAt: string;
  totalOrders: number;
  totalSales: string;
}

export const sellersPageMeta = {
  title: 'Seller Management',
  description: 'Manage sellers, review applications, and monitor seller performance.',
  breadcrumb: [
    { label: 'Home', href: '/' as string | undefined },
    { label: 'Sellers', href: undefined as string | undefined },
  ],
};

export const sellerKpis: SellerKpi[] = [
  {
    id: 'total',
    label: 'Total Sellers',
    value: '248',
    change: '+12.5%',
    changeLabel: 'vs last 30 days',
    tone: 'primary',
  },
  {
    id: 'active',
    label: 'Active Sellers',
    value: '201',
    change: '+10.2%',
    changeLabel: 'vs last 30 days',
    tone: 'success',
  },
  {
    id: 'pending',
    label: 'Pending Approval',
    value: '18',
    change: '+5.6%',
    changeLabel: 'vs last 30 days',
    tone: 'warning',
  },
  {
    id: 'suspended',
    label: 'Suspended Sellers',
    value: '9',
    change: '+18.2%',
    changeLabel: 'vs last 30 days',
    tone: 'destructive',
  },
  {
    id: 'commission',
    label: 'Total Commission',
    value: '$12,458.32',
    change: '+22.4%',
    changeLabel: 'vs last 30 days',
    tone: 'info',
  },
];

export const adminSellers: AdminSeller[] = [
  {
    id: 'sell_001',
    displayId: '#SELL-001',
    name: 'Nguyen Van A',
    initials: 'NA',
    accent: '#6366F1',
    shopName: 'TechWorld Store',
    category: 'Electronics',
    email: 'nguyenvana@email.com',
    status: 'active',
    verified: true,
    joinedAt: 'Sep 12, 2025 10:24 AM',
    totalOrders: 1248,
    totalSales: '$156,420.00',
  },
  {
    id: 'sell_002',
    displayId: '#SELL-002',
    name: 'Tran Thi B',
    initials: 'TB',
    accent: '#EC4899',
    shopName: 'Fashion Hub',
    category: 'Fashion',
    email: 'tranthib@email.com',
    status: 'pending',
    verified: false,
    joinedAt: 'Sep 20, 2025 02:15 PM',
    totalOrders: 0,
    totalSales: '$0.00',
  },
  {
    id: 'sell_003',
    displayId: '#SELL-003',
    name: 'Le Van C',
    initials: 'LC',
    accent: '#0EA5E9',
    shopName: 'Home Comfort',
    category: 'Home & Living',
    email: 'levanc@email.com',
    status: 'active',
    verified: true,
    joinedAt: 'Aug 05, 2025 09:40 AM',
    totalOrders: 856,
    totalSales: '$98,230.50',
  },
  {
    id: 'sell_004',
    displayId: '#SELL-004',
    name: 'Pham Minh D',
    initials: 'PD',
    accent: '#F59E0B',
    shopName: 'SportZone',
    category: 'Sports',
    email: 'phamminhd@email.com',
    status: 'suspended',
    verified: true,
    joinedAt: 'Jul 18, 2025 04:22 PM',
    totalOrders: 312,
    totalSales: '$24,880.00',
  },
  {
    id: 'sell_005',
    displayId: '#SELL-005',
    name: 'Hoang Thi E',
    initials: 'HE',
    accent: '#22C55E',
    shopName: 'Beauty Glow',
    category: 'Beauty',
    email: 'hoangthie@email.com',
    status: 'active',
    verified: true,
    joinedAt: 'Jun 30, 2025 11:05 AM',
    totalOrders: 642,
    totalSales: '$71,150.75',
  },
  {
    id: 'sell_006',
    displayId: '#SELL-006',
    name: 'Vu Duc F',
    initials: 'VF',
    accent: '#8B5CF6',
    shopName: 'Gadget Pro',
    category: 'Electronics',
    email: 'vuducf@email.com',
    status: 'pending',
    verified: false,
    joinedAt: 'Sep 21, 2025 08:50 AM',
    totalOrders: 0,
    totalSales: '$0.00',
  },
  {
    id: 'sell_007',
    displayId: '#SELL-007',
    name: 'Doan Hai G',
    initials: 'DG',
    accent: '#14B8A6',
    shopName: 'Kids Paradise',
    category: 'Toys',
    email: 'doanhaig@email.com',
    status: 'active',
    verified: false,
    joinedAt: 'May 14, 2025 03:30 PM',
    totalOrders: 428,
    totalSales: '$35,640.20',
  },
  {
    id: 'sell_008',
    displayId: '#SELL-008',
    name: 'Bui Lan H',
    initials: 'BH',
    accent: '#EF4444',
    shopName: 'Book Corner',
    category: 'Books',
    email: 'builanh@email.com',
    status: 'suspended',
    verified: false,
    joinedAt: 'Apr 02, 2025 01:18 PM',
    totalOrders: 95,
    totalSales: '$4,220.00',
  },
  {
    id: 'sell_009',
    displayId: '#SELL-009',
    name: 'Ngo Quoc I',
    initials: 'NI',
    accent: '#64748B',
    shopName: 'Auto Parts VN',
    category: 'Automotive',
    email: 'ngoquoci@email.com',
    status: 'active',
    verified: true,
    joinedAt: 'Mar 22, 2025 10:00 AM',
    totalOrders: 1104,
    totalSales: '$210,980.00',
  },
  {
    id: 'sell_010',
    displayId: '#SELL-010',
    name: 'Dang My J',
    initials: 'DJ',
    accent: '#A855F7',
    shopName: 'Pet Care Plus',
    category: 'Pets',
    email: 'dangmyj@email.com',
    status: 'active',
    verified: true,
    joinedAt: 'Feb 11, 2025 06:45 PM',
    totalOrders: 267,
    totalSales: '$18,930.40',
  },
];

export const SELLER_PAGE_SIZE = 10;
export const SELLER_TOTAL_COUNT = 248;
export const SELLER_TOTAL_PAGES = 25;

export const sellerStatusLabel: Record<SellerStatus, string> = {
  active: 'Active',
  pending: 'Pending',
  suspended: 'Suspended',
};

export type SellerSort = 'newest' | 'oldest' | 'sales_desc' | 'orders_desc';

export function filterSellers(
  sellers: AdminSeller[],
  query: {
    q?: string;
    status?: SellerStatus | 'all';
    verified?: 'all' | 'verified' | 'unverified';
    sort?: SellerSort;
  },
): AdminSeller[] {
  const q = query.q?.trim().toLowerCase();
  let rows = sellers.filter((seller) => {
    if (query.status && query.status !== 'all' && seller.status !== query.status) return false;
    if (query.verified === 'verified' && !seller.verified) return false;
    if (query.verified === 'unverified' && seller.verified) return false;
    if (!q) return true;
    return (
      seller.name.toLowerCase().includes(q) ||
      seller.email.toLowerCase().includes(q) ||
      seller.shopName.toLowerCase().includes(q) ||
      seller.displayId.toLowerCase().includes(q) ||
      seller.id.toLowerCase().includes(q)
    );
  });

  const sort = query.sort ?? 'newest';
  rows = [...rows].sort((a, b) => {
    switch (sort) {
      case 'oldest':
        return a.joinedAt.localeCompare(b.joinedAt);
      case 'sales_desc':
        return parseSales(b.totalSales) - parseSales(a.totalSales);
      case 'orders_desc':
        return b.totalOrders - a.totalOrders;
      case 'newest':
      default:
        return b.joinedAt.localeCompare(a.joinedAt);
    }
  });

  return rows;
}

function parseSales(value: string): number {
  return Number(value.replace(/[^0-9.]/g, '')) || 0;
}
