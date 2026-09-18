export type SearchParams = Record<string, string | string[] | undefined>;

export type AccountsStatusFilter = 'all' | 'active' | 'inactive' | 'blocked';

export interface AccountsQuery {
  q?: string;
  status: AccountsStatusFilter;
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

function parseStatus(raw: string | undefined): AccountsStatusFilter {
  if (raw === 'active' || raw === 'inactive' || raw === 'blocked') return raw;
  return 'all';
}

export function parseAccountsQuery(searchParams: SearchParams): AccountsQuery {
  return {
    q: first(searchParams.q)?.trim() || undefined,
    status: parseStatus(first(searchParams.status)?.trim().toLowerCase()),
    page: parsePage(first(searchParams.page)?.trim()),
  };
}

export function accountsHref(query: Partial<AccountsQuery>): string {
  const params = new URLSearchParams();
  if (query.q?.trim()) params.set('q', query.q.trim());
  if (query.status && query.status !== 'all') params.set('status', query.status);
  if (query.page && query.page > 1) params.set('page', String(query.page));
  const qs = params.toString();
  return qs ? `/accounts?${qs}` : '/accounts';
}

export function hasRemovedAccountsRoleParam(searchParams: SearchParams): boolean {
  return Boolean(first(searchParams.role)?.trim());
}
