export type SearchParams = Record<string, string | string[] | undefined>;

export type SellersStatusFilter = 'all' | 'active' | 'pending' | 'suspended';
export type SellersVerifiedFilter = 'all' | 'verified' | 'unverified';
export type SellersSort = 'newest' | 'oldest' | 'sales_desc' | 'orders_desc';

export interface SellersQuery {
  q?: string;
  status: SellersStatusFilter;
  verified: SellersVerifiedFilter;
  sort: SellersSort;
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

function parseStatus(raw: string | undefined): SellersStatusFilter {
  if (raw === 'active' || raw === 'pending' || raw === 'suspended') return raw;
  return 'all';
}

function parseVerified(raw: string | undefined): SellersVerifiedFilter {
  if (raw === 'verified' || raw === 'unverified') return raw;
  return 'all';
}

function parseSort(raw: string | undefined): SellersSort {
  if (raw === 'oldest' || raw === 'sales_desc' || raw === 'orders_desc') return raw;
  return 'newest';
}

export function parseSellersQuery(searchParams: SearchParams): SellersQuery {
  return {
    q: first(searchParams.q)?.trim() || undefined,
    status: parseStatus(first(searchParams.status)?.trim().toLowerCase()),
    verified: parseVerified(first(searchParams.verified)?.trim().toLowerCase()),
    sort: parseSort(first(searchParams.sort)?.trim().toLowerCase()),
    page: parsePage(first(searchParams.page)?.trim()),
  };
}

export function sellersHref(query: Partial<SellersQuery>): string {
  const params = new URLSearchParams();
  if (query.q?.trim()) params.set('q', query.q.trim());
  if (query.status && query.status !== 'all') params.set('status', query.status);
  if (query.verified && query.verified !== 'all') params.set('verified', query.verified);
  if (query.sort && query.sort !== 'newest') params.set('sort', query.sort);
  if (query.page && query.page > 1) params.set('page', String(query.page));
  const qs = params.toString();
  return qs ? `/sellers?${qs}` : '/sellers';
}
