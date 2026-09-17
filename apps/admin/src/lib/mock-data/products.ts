/**
 * Presentation fixtures for Admin Product Management until a Catalog
 * Gateway adapter exists for the admin console.
 */

export type ProductStatus = 'active' | 'inactive';

export interface ProductKpi {
  id: string;
  label: string;
  value: string;
  change: string;
  changeLabel: string;
  tone: 'primary' | 'success' | 'warning' | 'destructive' | 'muted';
}

export interface AdminProduct {
  id: string;
  name: string;
  subtitle: string;
  sku: string;
  category: string;
  brand: string;
  price: string;
  stock: number;
  status: ProductStatus;
  createdAt: string;
  accent: string;
  initials: string;
}

export const productsPageMeta = {
  title: 'Products',
  description: 'Manage your product catalog, inventory and product information.',
  breadcrumb: [
    { label: 'Home', href: '/' as string | undefined },
    { label: 'Products', href: undefined as string | undefined },
  ],
};

export const productKpis: ProductKpi[] = [
  {
    id: 'total',
    label: 'Total Products',
    value: '1,248',
    change: '+12.5%',
    changeLabel: 'vs last 30 days',
    tone: 'primary',
  },
  {
    id: 'active',
    label: 'Active Products',
    value: '1,176',
    change: '+10.8%',
    changeLabel: 'vs last 30 days',
    tone: 'success',
  },
  {
    id: 'oos',
    label: 'Out of Stock',
    value: '72',
    change: '-18.2%',
    changeLabel: 'vs last 30 days',
    tone: 'destructive',
  },
  {
    id: 'value',
    label: 'Total Value',
    value: '$482,560',
    change: '+15.6%',
    changeLabel: 'vs last 30 days',
    tone: 'muted',
  },
];

export const productCategories = [
  'Electronics',
  'Fashion',
  'Health & Beauty',
  'Home & Living',
  'Sports',
] as const;

export const productBrands = [
  'Apple',
  'Samsung',
  'Nike',
  'Sony',
  'Dyson',
  'Adidas',
  'L\'Oreal',
  'IKEA',
] as const;

export const adminProducts: AdminProduct[] = [
  {
    id: 'prd_1001',
    name: 'Apple AirPods Pro 2',
    subtitle: 'Wireless Earbuds',
    sku: 'AP-001',
    category: 'Electronics',
    brand: 'Apple',
    price: '$249.00',
    stock: 45,
    status: 'active',
    createdAt: 'Sep 12, 2025 10:24 AM',
    accent: '#6366F1',
    initials: 'AP',
  },
  {
    id: 'prd_1002',
    name: 'Samsung Galaxy Watch 6',
    subtitle: 'Smartwatch 44mm',
    sku: 'SM-002',
    category: 'Electronics',
    brand: 'Samsung',
    price: '$299.00',
    stock: 32,
    status: 'active',
    createdAt: 'Sep 11, 2025 03:15 PM',
    accent: '#0EA5E9',
    initials: 'SG',
  },
  {
    id: 'prd_1003',
    name: 'Nike Air Force 1',
    subtitle: 'Lifestyle Sneakers',
    sku: 'NK-003',
    category: 'Fashion',
    brand: 'Nike',
    price: '$110.00',
    stock: 128,
    status: 'active',
    createdAt: 'Sep 10, 2025 09:42 AM',
    accent: '#111827',
    initials: 'NK',
  },
  {
    id: 'prd_1004',
    name: 'Sony WH-1000XM5',
    subtitle: 'Noise Cancelling Headphones',
    sku: 'SN-004',
    category: 'Electronics',
    brand: 'Sony',
    price: '$348.00',
    stock: 0,
    status: 'active',
    createdAt: 'Sep 09, 2025 02:08 PM',
    accent: '#64748B',
    initials: 'SN',
  },
  {
    id: 'prd_1005',
    name: 'Dyson V15 Detect',
    subtitle: 'Cordless Vacuum',
    sku: 'DY-005',
    category: 'Home & Living',
    brand: 'Dyson',
    price: '$749.99',
    stock: 18,
    status: 'active',
    createdAt: 'Sep 08, 2025 11:30 AM',
    accent: '#A855F7',
    initials: 'DY',
  },
  {
    id: 'prd_1006',
    name: 'Adidas Ultraboost 22',
    subtitle: 'Running Shoes',
    sku: 'AD-006',
    category: 'Sports',
    brand: 'Adidas',
    price: '$180.00',
    stock: 64,
    status: 'inactive',
    createdAt: 'Sep 07, 2025 04:55 PM',
    accent: '#EF4444',
    initials: 'AD',
  },
  {
    id: 'prd_1007',
    name: 'L\'Oreal Revitalift Serum',
    subtitle: 'Anti-Aging Skincare',
    sku: 'LR-007',
    category: 'Health & Beauty',
    brand: 'L\'Oreal',
    price: '$32.99',
    stock: 210,
    status: 'active',
    createdAt: 'Sep 06, 2025 08:20 AM',
    accent: '#EC4899',
    initials: 'LR',
  },
  {
    id: 'prd_1008',
    name: 'IKEA MALM Desk',
    subtitle: 'Oak Veneer Workspace',
    sku: 'IK-008',
    category: 'Home & Living',
    brand: 'IKEA',
    price: '$199.00',
    stock: 27,
    status: 'active',
    createdAt: 'Sep 05, 2025 01:12 PM',
    accent: '#F59E0B',
    initials: 'IK',
  },
  {
    id: 'prd_1009',
    name: 'Apple MacBook Air M3',
    subtitle: '13-inch Laptop',
    sku: 'AP-009',
    category: 'Electronics',
    brand: 'Apple',
    price: '$1,099.00',
    stock: 12,
    status: 'active',
    createdAt: 'Sep 04, 2025 10:05 AM',
    accent: '#8B5CF6',
    initials: 'MB',
  },
  {
    id: 'prd_1010',
    name: 'Samsung Galaxy Buds 3',
    subtitle: 'True Wireless Earbuds',
    sku: 'SM-010',
    category: 'Electronics',
    brand: 'Samsung',
    price: '$179.00',
    stock: 0,
    status: 'inactive',
    createdAt: 'Sep 03, 2025 06:40 PM',
    accent: '#14B8A6',
    initials: 'GB',
  },
];

export const PRODUCT_PAGE_SIZE = 10;
export const PRODUCT_TOTAL_COUNT = 1248;
export const PRODUCT_TOTAL_PAGES = 125;

export const productStatusLabel: Record<ProductStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
};

export function filterProducts(
  products: AdminProduct[],
  query: {
    q?: string;
    category?: string | 'all';
    brand?: string | 'all';
    status?: ProductStatus | 'all';
  },
): AdminProduct[] {
  const q = query.q?.trim().toLowerCase();
  return products.filter((product) => {
    if (query.category && query.category !== 'all' && product.category !== query.category) {
      return false;
    }
    if (query.brand && query.brand !== 'all' && product.brand !== query.brand) {
      return false;
    }
    if (query.status && query.status !== 'all' && product.status !== query.status) {
      return false;
    }
    if (!q) return true;
    return (
      product.name.toLowerCase().includes(q) ||
      product.subtitle.toLowerCase().includes(q) ||
      product.sku.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q) ||
      product.brand.toLowerCase().includes(q)
    );
  });
}
