export type SearchParams = Record<string, string | string[] | undefined>;

export type ApprovalsStatusFilter = 'all' | 'pending' | 'approved' | 'rejected';
export type ApprovalsSort = 'newest' | 'oldest';

export interface ApprovalsQuery {
  q?: string;
  status: ApprovalsStatusFilter;
  category: string;
  sort: ApprovalsSort;
  page: number;
  /** Selected application for the detail drawer. */
  id?: string;
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

function parseStatus(raw: string | undefined): ApprovalsStatusFilter {
  if (raw === 'pending' || raw === 'approved' || raw === 'rejected' || raw === 'all') return raw;
  return 'pending';
}

function parseSort(raw: string | undefined): ApprovalsSort {
  if (raw === 'oldest') return 'oldest';
  return 'newest';
}

export function parseApprovalsQuery(searchParams: SearchParams): ApprovalsQuery {
  const category = first(searchParams.category)?.trim().toLowerCase() || 'all';
  return {
    q: first(searchParams.q)?.trim() || undefined,
    status: parseStatus(first(searchParams.status)?.trim().toLowerCase()),
    category: category || 'all',
    sort: parseSort(first(searchParams.sort)?.trim().toLowerCase()),
    page: parsePage(first(searchParams.page)?.trim()),
    id: first(searchParams.id)?.trim() || undefined,
  };
}

export function approvalsHref(query: Partial<ApprovalsQuery>): string {
  const params = new URLSearchParams();
  if (query.q?.trim()) params.set('q', query.q.trim());
  if (query.status && query.status !== 'pending') params.set('status', query.status);
  if (query.category && query.category !== 'all') params.set('category', query.category);
  if (query.sort && query.sort !== 'newest') params.set('sort', query.sort);
  if (query.page && query.page > 1) params.set('page', String(query.page));
  if (query.id?.trim()) params.set('id', query.id.trim());
  const qs = params.toString();
  return qs ? `/sellers/approvals?${qs}` : '/sellers/approvals';
}
