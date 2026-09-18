/**
 * Presentation fixtures for Seller Product Management until a Seller /
 * Catalog Gateway adapter exists. Do not treat as domain aggregates.
 */

export type SellerProductStatus =
  | 'active'
  | 'pending'
  | 'out_of_stock'
  | 'locked';

export type SellerSeoLevel = 'good' | 'needs_work' | 'poor';

export interface SellerProductKpi {
  id: string;
  label: string;
  value: string;
  change: string;
  changeTone: 'up' | 'down';
}

export interface SellerProductRow {
  id: string;
  name: string;
  sku: string;
  categoryPath: string;
  price: string;
  comparePrice?: string;
  discountLabel?: string;
  stock: number;
  variantCount: number;
  status: SellerProductStatus;
  score: number;
  seo: SellerSeoLevel;
  seoTips: number;
  accent: string;
  initials: string;
}

export interface SellerSeoTip {
  id: string;
  text: string;
  done?: boolean;
  meta?: string;
}

export const sellerProductKpis: SellerProductKpi[] = [
  {
    id: 'total',
    label: 'Tổng sản phẩm',
    value: '128',
    change: '↑ 12%',
    changeTone: 'up',
  },
  {
    id: 'active',
    label: 'Đang hoạt động',
    value: '102',
    change: '↑ 8%',
    changeTone: 'up',
  },
  {
    id: 'pending',
    label: 'Chờ duyệt',
    value: '15',
    change: '↑ 3%',
    changeTone: 'up',
  },
  {
    id: 'oos',
    label: 'Hết hàng',
    value: '7',
    change: '↓ 2%',
    changeTone: 'down',
  },
  {
    id: 'locked',
    label: 'Bị tạm khóa/Vi phạm',
    value: '4',
    change: '↓ 1%',
    changeTone: 'down',
  },
];

export const sellerProductTabs = [
  { id: 'all', label: 'Tất cả', count: 128 },
  { id: 'active', label: 'Đang hoạt động', count: 102 },
  { id: 'pending', label: 'Chờ duyệt', count: 15 },
  { id: 'out_of_stock', label: 'Hết hàng', count: 7 },
  { id: 'locked', label: 'Bị tạm khóa/Vi phạm', count: 4 },
] as const;

export const sellerProductCategories = [
  'Điện tử',
  'Thời trang',
  'Làm đẹp',
  'Gia dụng',
] as const;

export const sellerProducts: SellerProductRow[] = [
  {
    id: 'sp_1001',
    name: 'Tai nghe Bluetooth Pro 5',
    sku: 'SP-BT-001',
    categoryPath: 'Điện tử › Âm thanh › Tai nghe',
    price: '1.299.000₫',
    comparePrice: '1.599.000₫',
    discountLabel: '-19%',
    stock: 120,
    variantCount: 3,
    status: 'active',
    score: 78,
    seo: 'needs_work',
    seoTips: 3,
    accent: '#0EA5E9',
    initials: 'TB',
  },
  {
    id: 'sp_1002',
    name: 'Samsung Galaxy Watch 6',
    sku: 'SP-SW-002',
    categoryPath: 'Điện tử › Đồng hồ thông minh',
    price: '6.490.000₫',
    comparePrice: '7.290.000₫',
    discountLabel: '-11%',
    stock: 45,
    variantCount: 2,
    status: 'active',
    score: 92,
    seo: 'good',
    seoTips: 0,
    accent: '#6366F1',
    initials: 'GW',
  },
  {
    id: 'sp_1003',
    name: 'Giày sneaker Urban Flex',
    sku: 'SP-SN-003',
    categoryPath: 'Thời trang › Giày dép',
    price: '890.000₫',
    stock: 0,
    variantCount: 5,
    status: 'out_of_stock',
    score: 64,
    seo: 'needs_work',
    seoTips: 2,
    accent: '#111827',
    initials: 'UF',
  },
  {
    id: 'sp_1004',
    name: 'Balo laptop Slim 15"',
    sku: 'SP-BL-004',
    categoryPath: 'Thời trang › Phụ kiện',
    price: '459.000₫',
    comparePrice: '529.000₫',
    discountLabel: '-13%',
    stock: 86,
    variantCount: 4,
    status: 'pending',
    score: 71,
    seo: 'needs_work',
    seoTips: 4,
    accent: '#F59E0B',
    initials: 'BL',
  },
  {
    id: 'sp_1005',
    name: 'Serum dưỡng da Vitamin C',
    sku: 'SP-SR-005',
    categoryPath: 'Làm đẹp › Chăm sóc da',
    price: '320.000₫',
    stock: 210,
    variantCount: 1,
    status: 'locked',
    score: 48,
    seo: 'poor',
    seoTips: 5,
    accent: '#EC4899',
    initials: 'VC',
  },
];

export const SELLER_PRODUCT_PAGE_SIZE = 5;
export const SELLER_PRODUCT_TOTAL_COUNT = 128;
export const SELLER_PRODUCT_TOTAL_PAGES = 26;

export const sellerProductStatusLabel: Record<SellerProductStatus, string> = {
  active: 'Đang hoạt động',
  pending: 'Chờ duyệt',
  out_of_stock: 'Hết hàng',
  locked: 'Bị tạm khóa',
};

export const sellerSeoLevelLabel: Record<SellerSeoLevel, string> = {
  good: 'Tốt',
  needs_work: 'Cần tối ưu',
  poor: 'Kém',
};

export const sellerSeoFocusProduct = {
  id: 'sp_1001',
  name: 'Tai nghe Bluetooth Pro 5',
  score: 78,
  accent: '#0EA5E9',
  initials: 'TB',
  tips: [
    {
      id: 't1',
      text: 'Thêm từ khóa chính vào tiêu đề sản phẩm',
    },
    {
      id: 't2',
      text: 'Sử dụng ít nhất 3 ảnh chất lượng cao',
      meta: 'Hiện tại: 2/5',
    },
    {
      id: 't3',
      text: 'Bổ sung mô tả chi tiết về pin và khả năng chống nước',
    },
  ] satisfies SellerSeoTip[],
};

export const sellerSeoBenefits = [
  'Tăng khả năng hiển thị trên trang tìm kiếm',
  'Tiếp cận nhiều khách hàng tiềm năng hơn',
  'Cải thiện tỷ lệ chuyển đổi mua hàng',
] as const;

export function filterSellerProducts(
  products: SellerProductRow[],
  query: {
    q?: string;
    tab?: string;
    category?: string;
  },
): SellerProductRow[] {
  const q = query.q?.trim().toLowerCase();
  return products.filter((product) => {
    if (query.tab && query.tab !== 'all' && product.status !== query.tab) return false;
    if (query.category && query.category !== 'all') {
      if (!product.categoryPath.toLowerCase().includes(query.category.toLowerCase())) {
        return false;
      }
    }
    if (!q) return true;
    return (
      product.name.toLowerCase().includes(q) ||
      product.sku.toLowerCase().includes(q) ||
      product.categoryPath.toLowerCase().includes(q)
    );
  });
}
