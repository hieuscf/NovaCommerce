export type SearchParams = Record<string, string | string[] | undefined>;

export type RolesTypeFilter = 'all' | 'system' | 'custom';
export type RolesTab = 'permissions' | 'users' | 'description';
export type RolesGrantFilter = 'all' | 'granted' | 'not_granted';

export interface RolesQuery {
  q?: string;
  type: RolesTypeFilter;
  roleId?: string;
  tab: RolesTab;
  grant: RolesGrantFilter;
  pq?: string;
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

function parseType(raw: string | undefined): RolesTypeFilter {
  if (raw === 'system' || raw === 'custom') return raw;
  return 'all';
}

function parseTab(raw: string | undefined): RolesTab {
  if (raw === 'users' || raw === 'description') return raw;
  return 'permissions';
}

function parseGrant(raw: string | undefined): RolesGrantFilter {
  if (raw === 'granted' || raw === 'not_granted') return raw;
  return 'all';
}

export function parseRolesQuery(searchParams: SearchParams): RolesQuery {
  return {
    q: first(searchParams.q)?.trim() || undefined,
    type: parseType(first(searchParams.type)?.trim().toLowerCase()),
    roleId: first(searchParams.role)?.trim() || undefined,
    tab: parseTab(first(searchParams.tab)?.trim().toLowerCase()),
    grant: parseGrant(first(searchParams.grant)?.trim().toLowerCase()),
    pq: first(searchParams.pq)?.trim() || undefined,
    page: parsePage(first(searchParams.page)?.trim()),
  };
}

export function rolesHref(query: Partial<RolesQuery>): string {
  const params = new URLSearchParams();
  if (query.q?.trim()) params.set('q', query.q.trim());
  if (query.type && query.type !== 'all') params.set('type', query.type);
  if (query.roleId?.trim()) params.set('role', query.roleId.trim());
  if (query.tab && query.tab !== 'permissions') params.set('tab', query.tab);
  if (query.grant && query.grant !== 'all') params.set('grant', query.grant);
  if (query.pq?.trim()) params.set('pq', query.pq.trim());
  if (query.page && query.page > 1) params.set('page', String(query.page));
  const qs = params.toString();
  return qs ? `/accounts/roles?${qs}` : '/accounts/roles';
}
