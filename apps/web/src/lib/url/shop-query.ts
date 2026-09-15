import { SHOP_SORTS, type ShopSort } from '@/lib/view-models/shop';

export interface ShopQuery {
  readonly q?: string;
  readonly categories: readonly string[];
  readonly brands: readonly string[];
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly rating?: 3 | 4;
  readonly inStock: boolean;
  readonly sort: ShopSort;
  readonly sale: boolean;
  readonly page: number;
}

type SearchParams = Record<string, string | string[] | undefined>;

function all(value: string | string[] | undefined): string[] {
  if (value == null) {
    return [];
  }
  const raw = Array.isArray(value) ? value : [value];
  return raw
    .flatMap((item) => item.split(','))
    .map((item) => item.trim())
    .filter(Boolean);
}

function first(value: string | string[] | undefined): string | undefined {
  return all(value)[0];
}

function parsePage(value: string | undefined): number {
  const page = Number(value ?? '1');
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function parseMoney(value: string | undefined): number | undefined {
  if (value == null || value === '') {
    return undefined;
  }
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : undefined;
}

function parseSort(value: string | undefined): ShopSort {
  return SHOP_SORTS.some((sort) => sort === value) ? (value as ShopSort) : 'featured';
}

function parseRating(value: string | undefined): 3 | 4 | undefined {
  if (value === '3') {
    return 3;
  }
  if (value === '4') {
    return 4;
  }
  return undefined;
}

export function parseShopQuery(searchParams: SearchParams): ShopQuery {
  return {
    q: first(searchParams.q)?.trim() || undefined,
    categories: all(searchParams.category),
    brands: all(searchParams.brand),
    minPrice: parseMoney(first(searchParams.minPrice)),
    maxPrice: parseMoney(first(searchParams.maxPrice)),
    rating: parseRating(first(searchParams.rating)),
    inStock: first(searchParams.availability) === 'in-stock',
    sort: parseSort(first(searchParams.sort)),
    sale: first(searchParams.sale) === 'true',
    page: parsePage(first(searchParams.page)),
  };
}

export function toShopSearchParams(query: ShopQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.q) {
    params.set('q', query.q);
  }
  for (const category of query.categories) {
    params.append('category', category);
  }
  for (const brand of query.brands) {
    params.append('brand', brand);
  }
  if (query.minPrice != null) {
    params.set('minPrice', String(query.minPrice));
  }
  if (query.maxPrice != null) {
    params.set('maxPrice', String(query.maxPrice));
  }
  if (query.rating) {
    params.set('rating', String(query.rating));
  }
  if (query.inStock) {
    params.set('availability', 'in-stock');
  }
  if (query.sort !== 'featured') {
    params.set('sort', query.sort);
  }
  if (query.sale) {
    params.set('sale', 'true');
  }
  if (query.page > 1) {
    params.set('page', String(query.page));
  }
  return params;
}

export function shopHref(query: ShopQuery): string {
  const qs = toShopSearchParams(query).toString();
  return qs ? `/shop?${qs}` : '/shop';
}

export function hasActiveShopFilters(query: ShopQuery): boolean {
  return Boolean(
    query.q ||
      query.categories.length > 0 ||
      query.brands.length > 0 ||
      query.minPrice != null ||
      query.maxPrice != null ||
      query.rating ||
      query.inStock ||
      query.sale,
  );
}
