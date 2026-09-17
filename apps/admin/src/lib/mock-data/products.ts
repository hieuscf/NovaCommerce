/**
 * Presentation fixtures for Admin Product Management until a Catalog
 * Gateway adapter exists for the admin console.
 */

export type ProductStatus = 'active' | 'inactive' | 'draft' | 'archived';

export type ProductReportTone = 'destructive' | 'warning' | 'success';

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
  hasViolation?: boolean;
}

export interface ProductReportEvent {
  id: string;
  title: string;
  description: string;
  time: string;
  tone: ProductReportTone;
}

export interface ProductRelatedItem {
  id: string;
  name: string;
  price: string;
  accent: string;
  initials: string;
}

export interface AdminProductDetail extends AdminProduct {
  barcode: string;
  comparePrice: string;
  costPrice: string;
  taxRate: string;
  weight: string;
  dimensions: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
  description: string;
  features: string[];
  specifications: Array<{ label: string; value: string }>;
  attributes: Array<{ label: string; value: string }>;
  tags: string[];
  locked: boolean;
  hasViolation: boolean;
  violationMessage: string;
  reportHistory: ProductReportEvent[];
  relatedProducts: ProductRelatedItem[];
  mediaCount: number;
  storeSlug: string;
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
    hasViolation: true,
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
    hasViolation: true,
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
  draft: 'Draft',
  archived: 'Archived',
};

export function getAdminProduct(id: string): AdminProduct | undefined {
  return adminProducts.find((product) => product.id === id);
}

export function getProductDetail(id: string): AdminProductDetail | undefined {
  const product = getAdminProduct(id);
  if (!product) return undefined;

  const related = adminProducts
    .filter((item) => item.id !== product.id && item.brand === product.brand)
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      accent: item.accent,
      initials: item.initials,
    }));

  const fallbackRelated = adminProducts
    .filter((item) => item.id !== product.id)
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      accent: item.accent,
      initials: item.initials,
    }));

  const hasViolation = Boolean(product.hasViolation);

  return {
    ...product,
    hasViolation,
    barcode: `890${product.sku.replace(/[^A-Z0-9]/gi, '').padEnd(9, '0').slice(0, 9)}`,
    comparePrice: product.price,
    costPrice: `$${(Number.parseFloat(product.price.replace(/[^0-9.]/g, '')) * 0.7).toFixed(2)}`,
    taxRate: '10%',
    weight: '0.45 kg',
    dimensions: '12 × 8 × 4 cm',
    updatedAt: product.createdAt,
    createdBy: 'Admin User',
    lastModifiedBy: 'Admin User',
    description: `${product.name} delivers a premium shopping experience with carefully selected materials, reliable performance, and packaging that matches NovaCommerce quality standards. Ideal for customers looking for ${product.subtitle.toLowerCase()} in the ${product.category} category.`,
    features: [
      `Brand: ${product.brand} authenticated listing`,
      `Category placement: ${product.category}`,
      `SKU tracked inventory with live stock sync`,
      'Storefront-ready media gallery and SEO fields',
      'Eligible for promotions and featured rails',
    ],
    specifications: [
      { label: 'SKU', value: product.sku },
      { label: 'Brand', value: product.brand },
      { label: 'Category', value: product.category },
      { label: 'Condition', value: 'New' },
      { label: 'Warranty', value: '12 months' },
    ],
    attributes: [
      { label: 'Color', value: 'Default' },
      { label: 'Size', value: 'Standard' },
      { label: 'Material', value: 'Premium' },
      { label: 'Origin', value: 'Official distributor' },
    ],
    tags: [product.brand, product.category, product.subtitle.split(' ')[0] ?? 'Featured', 'Catalog'],
    locked: product.status === 'inactive' && hasViolation,
    violationMessage: hasViolation
      ? 'This product has been reported for policy violation.'
      : '',
    reportHistory: hasViolation
      ? [
          {
            id: 'rpt_1',
            title: 'Policy Violation',
            description: 'Inappropriate content flagged in product description.',
            time: '2 hours ago',
            tone: 'destructive',
          },
          {
            id: 'rpt_2',
            title: 'User Report',
            description: 'Customer reported suspicious pricing or listing claims.',
            time: '1 day ago',
            tone: 'warning',
          },
          {
            id: 'rpt_3',
            title: 'Resolved',
            description: 'Content reviewed and updated by catalog ops.',
            time: '3 days ago',
            tone: 'success',
          },
        ]
      : [
          {
            id: 'rpt_ok',
            title: 'Resolved',
            description: 'No open reports. Listing passed last compliance check.',
            time: '5 days ago',
            tone: 'success',
          },
        ],
    relatedProducts: related.length > 0 ? related : fallbackRelated,
    mediaCount: 6,
    storeSlug: product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
  };
}

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
