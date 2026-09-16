import {
  PRODUCT_IMAGE_FALLBACK,
  type CategoryIndex,
} from '@/lib/catalog/mappers';
import type { ProductViewModel } from '@/lib/view-models/product';
import type { ProductSearchAttributeDto, ProductSearchItemDto } from './types';

const NEW_ARRIVAL_MS = 1000 * 60 * 60 * 24 * 45;

function attributeMap(attributes: readonly ProductSearchAttributeDto[]): Map<string, string> {
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

function parseNumber(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function mapSearchItemToViewModel(
  item: ProductSearchItemDto,
  categories: CategoryIndex,
): ProductViewModel {
  const attrs = attributeMap(item.attributes);
  const brand = item.brand?.name ?? readAttribute(attrs, 'brand', 'Brand') ?? 'Nova';
  const rating = parseNumber(readAttribute(attrs, 'rating', 'Rating')) ?? 0;
  const reviewCount = Math.max(
    0,
    Math.floor(parseNumber(readAttribute(attrs, 'reviewcount', 'reviews', 'ReviewCount')) ?? 0),
  );
  const compareAt =
    parseNumber(readAttribute(attrs, 'compareatprice', 'compare_at_price', 'CompareAtPrice')) ??
    undefined;

  const createdAtMs = Date.parse(item.createdAt);
  const isNew =
    Number.isFinite(createdAtMs) && Date.now() - createdAtMs <= NEW_ARRIVAL_MS
      ? true
      : readAttribute(attrs, 'badge')?.toLowerCase() === 'new';

  let badge: ProductViewModel['badge'];
  let discountPercent: number | undefined;
  if (compareAt !== undefined && compareAt > item.price) {
    badge = 'sale';
    discountPercent = Math.round(((compareAt - item.price) / compareAt) * 100);
  } else if (isNew) {
    badge = 'new';
  } else if (readAttribute(attrs, 'badge')?.toLowerCase() === 'bestseller') {
    badge = 'bestseller';
  }

  const categoryId = item.categories[0]?.id;

  return {
    id: item.id,
    name: item.name,
    brand,
    price: item.price,
    compareAtPrice: compareAt,
    currency: item.currency || 'USD',
    rating,
    reviewCount,
    imageUrl: item.images[0] || PRODUCT_IMAGE_FALLBACK,
    badge,
    discountPercent,
    slug: item.slug,
    categorySlug: categories.leafSlug(categoryId),
    departmentSlug: categories.rootSlug(categoryId),
    inStock: true,
    createdAt: item.createdAt.slice(0, 10),
  };
}
