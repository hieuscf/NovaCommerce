export interface ProductViewModel {
  id: string;
  name: string;
  brand: string;
  variant?: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  badge?: 'bestseller' | 'sale' | 'new';
  discountPercent?: number;
  slug: string;
  /** Leaf category on the listing page (smartphones, laptops, …). */
  categorySlug?: string;
  /** Parent department used by homepage category tiles (electronics, fashion, …). */
  departmentSlug?: string;
  inStock?: boolean;
  createdAt?: string;
}

export interface CategoryViewModel {
  id: string;
  name: string;
  productCount: number;
  imageUrl: string;
  slug: string;
}

export function productHref(slug: string): string {
  return `/products/${slug}`;
}

export function brandHref(brand: string): string {
  return `/shop?brand=${encodeURIComponent(brand)}`;
}

export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatReviewCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(count);
}
