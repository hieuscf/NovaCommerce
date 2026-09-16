import type { CategoryViewModel, ProductViewModel } from '@/lib/view-models/product';
import type { CategoryDto, ProductAttributeDto, ProductDto } from './types';

/** Shared placeholder when a product has no catalog images. */
export const PRODUCT_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=800&fit=crop';

/** Presentation images for Alloy homepage category tiles (API has no imageUrl). */
export const CATEGORY_IMAGE_BY_SLUG: Readonly<Record<string, string>> = {
  electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop',
  fashion: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop',
  'home-living': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
  'beauty-health': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
  'sports-outdoors': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop',
  'toys-games': 'https://images.unsplash.com/photo-1558060370-d644479cb6d2?w=400&h=400&fit=crop',
};

const NEW_ARRIVAL_MS = 1000 * 60 * 60 * 24 * 45;

export interface CategoryIndex {
  readonly byId: ReadonlyMap<string, CategoryDto>;
  leafSlug(categoryId: string | undefined): string | undefined;
  rootSlug(categoryId: string | undefined): string | undefined;
}

export function buildCategoryIndex(categories: readonly CategoryDto[]): CategoryIndex {
  const byId = new Map(categories.map((category) => [category.id, category]));

  const leafSlug = (categoryId: string | undefined): string | undefined => {
    if (!categoryId) {
      return undefined;
    }
    return byId.get(categoryId)?.slug;
  };

  const rootSlug = (categoryId: string | undefined): string | undefined => {
    if (!categoryId) {
      return undefined;
    }
    let current = byId.get(categoryId);
    if (!current) {
      return undefined;
    }
    while (current.parentId) {
      const parent = byId.get(current.parentId);
      if (!parent) {
        break;
      }
      current = parent;
    }
    return current.slug;
  };

  return { byId, leafSlug, rootSlug };
}

function attributeMap(attributes: readonly ProductAttributeDto[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const attribute of attributes) {
    map.set(attribute.name.trim().toLowerCase(), attribute.value);
  }
  return map;
}

function readAttribute(map: Map<string, string>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = map.get(key.toLowerCase());
    if (value?.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function primaryImageUrl(product: ProductDto): string {
  if (product.images.length === 0) {
    return PRODUCT_IMAGE_FALLBACK;
  }
  const sorted = [...product.images].sort((left, right) => left.sortOrder - right.sortOrder);
  return sorted[0]?.url || PRODUCT_IMAGE_FALLBACK;
}

function variantLabel(product: ProductDto): string | undefined {
  const first = product.variants[0];
  if (first) {
    const values = Object.values(first.attributes).filter(Boolean);
    if (values.length > 0) {
      return values.join(' · ');
    }
  }
  if (product.options.length > 0) {
    return product.options
      .map((option) => `${option.name}: ${option.values.join('/')}`)
      .join(' · ');
  }
  return undefined;
}

function parseNumber(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function mapProductToViewModel(
  product: ProductDto,
  categories: CategoryIndex,
): ProductViewModel {
  const attrs = attributeMap(product.attributes);
  const brand = readAttribute(attrs, 'brand', 'Brand') ?? 'Nova';
  const rating = parseNumber(readAttribute(attrs, 'rating', 'Rating')) ?? 0;
  const reviewCount = Math.max(
    0,
    Math.floor(parseNumber(readAttribute(attrs, 'reviewcount', 'reviews', 'ReviewCount')) ?? 0),
  );
  const compareAt =
    parseNumber(readAttribute(attrs, 'compareatprice', 'compare_at_price', 'CompareAtPrice')) ??
    undefined;

  const createdAtMs = Date.parse(product.createdAt);
  const isNew =
    Number.isFinite(createdAtMs) && Date.now() - createdAtMs <= NEW_ARRIVAL_MS
      ? true
      : readAttribute(attrs, 'badge')?.toLowerCase() === 'new';

  let badge: ProductViewModel['badge'];
  let discountPercent: number | undefined;
  if (compareAt !== undefined && compareAt > product.basePriceAmount) {
    badge = 'sale';
    discountPercent = Math.round(((compareAt - product.basePriceAmount) / compareAt) * 100);
  } else if (isNew) {
    badge = 'new';
  } else if (readAttribute(attrs, 'badge')?.toLowerCase() === 'bestseller') {
    badge = 'bestseller';
  }

  return {
    id: product.id,
    name: product.name,
    brand,
    variant: variantLabel(product),
    price: product.basePriceAmount,
    compareAtPrice: compareAt,
    currency: product.basePriceCurrency || 'USD',
    rating,
    reviewCount,
    imageUrl: primaryImageUrl(product),
    badge,
    discountPercent,
    slug: product.slug,
    categorySlug: categories.leafSlug(product.categoryId),
    departmentSlug: categories.rootSlug(product.categoryId),
    inStock: true,
    createdAt: product.createdAt.slice(0, 10),
  };
}

export function mapCategoryToViewModel(
  category: CategoryDto,
  productCount: number,
  imageUrl?: string,
): CategoryViewModel {
  return {
    id: category.id,
    name: category.name,
    productCount,
    imageUrl: imageUrl ?? CATEGORY_IMAGE_BY_SLUG[category.slug] ?? PRODUCT_IMAGE_FALLBACK,
    slug: category.slug,
  };
}

export function countProductsInCategoryTree(
  categoryId: string,
  categories: CategoryIndex,
  products: readonly ProductDto[],
): number {
  const ids = new Set<string>([categoryId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const category of categories.byId.values()) {
      if (category.parentId && ids.has(category.parentId) && !ids.has(category.id)) {
        ids.add(category.id);
        grew = true;
      }
    }
  }

  return products.reduce(
    (total, product) => total + (product.categoryId && ids.has(product.categoryId) ? 1 : 0),
    0,
  );
}
