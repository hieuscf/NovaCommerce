export type SearchParams = Record<string, string | string[] | undefined>;

export type ProductsCategoryFilter = 'all' | string;
export type ProductsBrandFilter = 'all' | string;
export type ProductsStatusFilter = 'all' | 'active' | 'inactive';

export interface ProductsQuery {
  q?: string;
  category: ProductsCategoryFilter;
  brand: ProductsBrandFilter;
  status: ProductsStatusFilter;
  page: number;
}

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parsePage(raw: string | undefined): number {
  const page = Number(raw);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

function parseStatus(raw: string | undefined): ProductsStatusFilter {
  if (raw === 'active' || raw === 'inactive') return raw;
  return 'all';
}

function parseNamedFilter(raw: string | undefined): string | 'all' {
  const value = raw?.trim();
  if (!value) return 'all';
  return value;
}

export function parseProductsQuery(searchParams: SearchParams): ProductsQuery {
  return {
    q: first(searchParams.q)?.trim() || undefined,
    category: parseNamedFilter(first(searchParams.category)),
    brand: parseNamedFilter(first(searchParams.brand)),
    status: parseStatus(first(searchParams.status)?.trim().toLowerCase()),
    page: parsePage(first(searchParams.page)?.trim()),
  };
}

export function productsHref(query: Partial<ProductsQuery>): string {
  const params = new URLSearchParams();
  if (query.q?.trim()) params.set('q', query.q.trim());
  if (query.category && query.category !== 'all') params.set('category', query.category);
  if (query.brand && query.brand !== 'all') params.set('brand', query.brand);
  if (query.status && query.status !== 'all') params.set('status', query.status);
  if (query.page && query.page > 1) params.set('page', String(query.page));
  const qs = params.toString();
  return qs ? `/products?${qs}` : '/products';
}
