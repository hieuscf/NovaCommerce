export interface ShopQuery {
  readonly q?: string;
  readonly category?: string;
  readonly sort?: 'price-asc' | 'price-desc' | 'newest';
  readonly sale?: boolean;
  readonly page: number;
}

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function parseShopQuery(searchParams: SearchParams): ShopQuery {
  const sort = first(searchParams.sort);
  const pageRaw = Number(first(searchParams.page) ?? '1');

  return {
    q: first(searchParams.q)?.trim() || undefined,
    category: first(searchParams.category)?.trim() || undefined,
    sort: sort === 'price-asc' || sort === 'price-desc' || sort === 'newest' ? sort : undefined,
    sale: first(searchParams.sale) === 'true',
    page: Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1,
  };
}
