/**
 * Presentation fixtures for the registered Seller Center dashboard until a
 * Seller Gateway adapter exists. Do not treat these as domain aggregates.
 */

export type SellerOrderStatus = 'processing' | 'delivered' | 'awaiting_pickup';

export interface SellerShopProfile {
  name: string;
  initials: string;
  shopId: string;
  businessType: string;
  verified: boolean;
  joinedAt: string;
}

export interface SellerDashboardKpi {
  id: string;
  label: string;
  value: string;
  change: string;
  tone: 'orders' | 'revenue' | 'products' | 'customers';
}

export interface SellerRevenuePoint {
  date: string;
  label: string;
  value: number;
}

export interface SellerRecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  total: string;
  status: SellerOrderStatus;
}

export interface SellerFeatureCard {
  id: string;
  title: string;
  description: string;
  href: string;
  tone: 'products' | 'promotions' | 'revenue' | 'support';
}

export const sellerShopProfile: SellerShopProfile = {
  name: 'HappyShop',
  initials: 'HN',
  shopId: 'NS123456',
  businessType: 'Phân phối chính hãng',
  verified: true,
  joinedAt: '12/04/2025',
};

export const sellerDashboardKpis: SellerDashboardKpi[] = [
  {
    id: 'orders',
    label: 'Tổng đơn hàng',
    value: '238',
    change: '↑ 12% so với tuần trước',
    tone: 'orders',
  },
  {
    id: 'revenue',
    label: 'Doanh thu (đã thanh toán)',
    value: '52.430.000₫',
    change: '↑ 18% so với tuần trước',
    tone: 'revenue',
  },
  {
    id: 'products',
    label: 'Sản phẩm đang bán',
    value: '64',
    change: '↑ 8% so với tuần trước',
    tone: 'products',
  },
  {
    id: 'customers',
    label: 'Khách hàng mới',
    value: '156',
    change: '↑ 22% so với tuần trước',
    tone: 'customers',
  },
];

export const sellerRevenueSeries: SellerRevenuePoint[] = [
  { date: '2025-04-14', label: '14/04', value: 22.4 },
  { date: '2025-04-15', label: '15/04', value: 28.1 },
  { date: '2025-04-16', label: '16/04', value: 19.6 },
  { date: '2025-04-17', label: '17/04', value: 31.2 },
  { date: '2025-04-18', label: '18/04', value: 26.8 },
  { date: '2025-04-19', label: '19/04', value: 34.5 },
  { date: '2025-04-20', label: '20/04', value: 38.5 },
];

export const sellerRevenueMeta = {
  total: '52.430.000₫',
  change: '+18%',
  rangeLabel: '14/04/2025 - 20/04/2025',
};

export const sellerRecentOrders: SellerRecentOrder[] = [
  {
    id: 'so_1',
    orderNumber: '#DH-10248',
    customer: 'Nguyễn Minh Anh',
    total: '1.290.000₫',
    status: 'processing',
  },
  {
    id: 'so_2',
    orderNumber: '#DH-10247',
    customer: 'Trần Hoàng Long',
    total: '850.000₫',
    status: 'delivered',
  },
  {
    id: 'so_3',
    orderNumber: '#DH-10246',
    customer: 'Lê Thu Hà',
    total: '2.150.000₫',
    status: 'awaiting_pickup',
  },
  {
    id: 'so_4',
    orderNumber: '#DH-10245',
    customer: 'Phạm Quốc Huy',
    total: '640.000₫',
    status: 'delivered',
  },
  {
    id: 'so_5',
    orderNumber: '#DH-10244',
    customer: 'Võ Bảo Ngọc',
    total: '1.780.000₫',
    status: 'processing',
  },
];

export const sellerOrderStatusLabel: Record<SellerOrderStatus, string> = {
  processing: 'Đang xử lý',
  delivered: 'Đã giao',
  awaiting_pickup: 'Chờ lấy hàng',
};

export const sellerFeatureCards: SellerFeatureCard[] = [
  {
    id: 'products',
    title: 'Quản lý sản phẩm',
    description: 'Thêm, sửa, xóa sản phẩm',
    href: '/seller?demo=registered&section=products',
    tone: 'products',
  },
  {
    id: 'promotions',
    title: 'Chương trình khuyến mãi',
    description: 'Tạo mã giảm giá, flash sale',
    href: '/seller?demo=registered#promotions',
    tone: 'promotions',
  },
  {
    id: 'revenue',
    title: 'Theo dõi doanh thu',
    description: 'Xem báo cáo chi tiết',
    href: '/seller?demo=registered#reports',
    tone: 'revenue',
  },
  {
    id: 'support',
    title: 'Hỗ trợ khách hàng',
    description: 'Trả lời tin nhắn, khiếu nại',
    href: '/seller?demo=registered#customers',
    tone: 'support',
  },
];

export interface SellerNavChild {
  href: string;
  label: string;
  section?: 'home' | 'products';
}

export interface SellerNavItem {
  href: string;
  label: string;
  icon: 'home' | 'products' | 'orders' | 'customers' | 'promotions' | 'finance' | 'reports' | 'settings';
  expandable?: boolean;
  section?: 'home' | 'products';
  children?: readonly SellerNavChild[];
}

export const sellerNavItems: readonly SellerNavItem[] = [
  {
    href: '/seller?demo=registered',
    label: 'Trang chủ',
    icon: 'home',
    section: 'home',
  },
  {
    href: '/seller?demo=registered&section=products',
    label: 'Sản phẩm',
    icon: 'products',
    expandable: true,
    section: 'products',
    children: [
      {
        href: '/seller?demo=registered&section=products',
        label: 'Tất cả sản phẩm',
        section: 'products',
      },
      {
        href: '/seller?demo=registered&section=products#add',
        label: 'Thêm sản phẩm mới',
      },
      {
        href: '/seller?demo=registered&section=products#inventory',
        label: 'Quản lý tồn kho & giá',
      },
      {
        href: '/seller?demo=registered&section=products#seo',
        label: 'SEO & Điểm sản phẩm',
      },
    ],
  },
  {
    href: '/seller?demo=registered#orders',
    label: 'Đơn hàng',
    icon: 'orders',
    expandable: true,
  },
  {
    href: '/seller?demo=registered#customers',
    label: 'Khách hàng',
    icon: 'customers',
  },
  {
    href: '/seller?demo=registered#promotions',
    label: 'Khuyến mãi',
    icon: 'promotions',
  },
  {
    href: '/seller?demo=registered#finance',
    label: 'Tài chính',
    icon: 'finance',
    expandable: true,
  },
  {
    href: '/seller?demo=registered#reports',
    label: 'Báo cáo',
    icon: 'reports',
    expandable: true,
  },
  {
    href: '/seller?demo=registered#settings',
    label: 'Cài đặt',
    icon: 'settings',
    expandable: true,
  },
];
