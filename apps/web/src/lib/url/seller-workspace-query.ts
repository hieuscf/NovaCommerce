export type SearchParams = Record<string, string | string[] | undefined>;

export type SellerWorkspaceSection = 'home' | 'products' | 'orders';

export type SellerProductsTabFilter =
  | 'all'
  | 'active'
  | 'pending'
  | 'out_of_stock'
  | 'locked';

export type SellerOrdersTabFilter =
  | 'all'
  | 'pending_confirm'
  | 'awaiting_pickup'
  | 'shipping'
  | 'delivered'
  | 'cancelled'
  | 'return_refund';

export interface SellerProductsQuery {
  q?: string;
  tab: SellerProductsTabFilter;
  category: string;
  page: number;
}

export interface SellerOrdersQuery {
  q?: string;
  tab: SellerOrdersTabFilter;
  status: string;
  range: string;
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

function parseProductsTab(raw: string | undefined): SellerProductsTabFilter {
  if (
    raw === 'active' ||
    raw === 'pending' ||
    raw === 'out_of_stock' ||
    raw === 'locked'
  ) {
    return raw;
  }
  return 'all';
}

function parseOrdersTab(raw: string | undefined): SellerOrdersTabFilter {
  if (
    raw === 'pending_confirm' ||
    raw === 'awaiting_pickup' ||
    raw === 'shipping' ||
    raw === 'delivered' ||
    raw === 'cancelled' ||
    raw === 'return_refund'
  ) {
    return raw;
  }
  return 'all';
}

export function parseSellerWorkspaceSection(
  searchParams?: SearchParams,
): SellerWorkspaceSection {
  const section = first(searchParams?.section)?.trim().toLowerCase();
  if (section === 'products') return 'products';
  if (section === 'orders') return 'orders';
  return 'home';
}

export function parseSellerProductsQuery(searchParams: SearchParams): SellerProductsQuery {
  return {
    q: first(searchParams.q)?.trim() || undefined,
    tab: parseProductsTab(first(searchParams.tab)?.trim().toLowerCase()),
    category: first(searchParams.category)?.trim() || 'all',
    page: parsePage(first(searchParams.page)?.trim()),
  };
}

export function parseSellerOrdersQuery(searchParams: SearchParams): SellerOrdersQuery {
  return {
    q: first(searchParams.q)?.trim() || undefined,
    tab: parseOrdersTab(first(searchParams.tab)?.trim().toLowerCase()),
    status: first(searchParams.status)?.trim() || 'all',
    range: first(searchParams.range)?.trim() || 'all',
    page: parsePage(first(searchParams.page)?.trim()),
  };
}

export function sellerWorkspaceHref(
  section: SellerWorkspaceSection,
  query: Partial<SellerProductsQuery & SellerOrdersQuery> = {},
): string {
  const params = new URLSearchParams();
  params.set('demo', 'registered');
  if (section !== 'home') params.set('section', section);

  if (section === 'products') {
    if (query.q?.trim()) params.set('q', query.q.trim());
    if (query.tab && query.tab !== 'all') params.set('tab', query.tab);
    if (query.category && query.category !== 'all') params.set('category', query.category);
    if (query.page && query.page > 1) params.set('page', String(query.page));
  }

  if (section === 'orders') {
    if (query.q?.trim()) params.set('q', query.q.trim());
    if (query.tab && query.tab !== 'all') params.set('tab', query.tab);
    if (query.status && query.status !== 'all') params.set('status', query.status);
    if (query.range && query.range !== 'all') params.set('range', query.range);
    if (query.page && query.page > 1) params.set('page', String(query.page));
  }

  const qs = params.toString();
  return qs ? `/seller?${qs}` : '/seller?demo=registered';
}
