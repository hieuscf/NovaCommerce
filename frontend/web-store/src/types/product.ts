export type Category = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
};

export type ProductBadge = 'new' | 'hot' | 'sale';

export type ProductVariant = {
  id: string;
  size: string;
  color: string;
  price: number;
  stock: number;
  sku: string;
};

export type ProductReview = {
  id: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  brand: string;
  description: string;
  basePrice: number;
  rating: number;
  ratingCount: number;
  badges: ProductBadge[];
  images: string[];
  variants: ProductVariant[];
  tags: string[];
  isTrending?: boolean;
  isRecommended?: boolean;
};
