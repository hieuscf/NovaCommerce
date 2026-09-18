export type SearchParams = Record<string, string | string[] | undefined>;

export type SellerWorkspaceSection =
  | 'home'
  | 'products'
  | 'orders'
  | 'finance'
  | 'promotions'
  | 'chat';

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

export type SellerFinanceTabFilter =
  | 'overview'
  | 'wallet'
  | 'withdrawals'
  | 'reports'
  | 'invoices';

export type SellerPromotionsTabFilter =
  | 'all'
  | 'vouchers'
  | 'flash_sale'
  | 'combo'
  | 'campaigns'
  | 'ads';

export type SellerChatTabFilter = 'messages' | 'reviews';

export type SellerChatInboxFilter = 'all' | 'unread' | 'read';

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

export interface SellerFinanceQuery {
  tab: SellerFinanceTabFilter;
  month: string;
}

export interface SellerPromotionsQuery {
  tab: SellerPromotionsTabFilter;
  range: string;
}

export interface SellerChatQuery {
  tab: SellerChatTabFilter;
  inbox: SellerChatInboxFilter;
  q?: string;
  thread?: string;
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

function parseFinanceTab(raw: string | undefined): SellerFinanceTabFilter {
  if (
    raw === 'overview' ||
    raw === 'withdrawals' ||
    raw === 'reports' ||
    raw === 'invoices'
  ) {
    return raw;
  }
  return 'wallet';
}

function parsePromotionsTab(raw: string | undefined): SellerPromotionsTabFilter {
  if (
    raw === 'vouchers' ||
    raw === 'flash_sale' ||
    raw === 'combo' ||
    raw === 'campaigns' ||
    raw === 'ads'
  ) {
    return raw;
  }
  return 'all';
}

function parseChatTab(raw: string | undefined): SellerChatTabFilter {
  if (raw === 'reviews') return 'reviews';
  return 'messages';
}

function parseChatInbox(raw: string | undefined): SellerChatInboxFilter {
  if (raw === 'unread' || raw === 'read') return raw;
  return 'all';
}

export function parseSellerWorkspaceSection(
  searchParams?: SearchParams,
): SellerWorkspaceSection {
  const section = first(searchParams?.section)?.trim().toLowerCase();
  if (section === 'products') return 'products';
  if (section === 'orders') return 'orders';
  if (section === 'finance') return 'finance';
  if (section === 'promotions') return 'promotions';
  if (section === 'chat') return 'chat';
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

export function parseSellerFinanceQuery(searchParams: SearchParams): SellerFinanceQuery {
  return {
    tab: parseFinanceTab(first(searchParams.tab)?.trim().toLowerCase()),
    month: first(searchParams.month)?.trim() || '2025-04',
  };
}

export function parseSellerPromotionsQuery(
  searchParams: SearchParams,
): SellerPromotionsQuery {
  return {
    tab: parsePromotionsTab(first(searchParams.tab)?.trim().toLowerCase()),
    range: first(searchParams.range)?.trim() || '2025-04',
  };
}

export function parseSellerChatQuery(searchParams: SearchParams): SellerChatQuery {
  return {
    tab: parseChatTab(first(searchParams.tab)?.trim().toLowerCase()),
    inbox: parseChatInbox(first(searchParams.inbox)?.trim().toLowerCase()),
    q: first(searchParams.q)?.trim() || undefined,
    thread: first(searchParams.thread)?.trim() || undefined,
  };
}

export function sellerWorkspaceHref(
  section: SellerWorkspaceSection,
  query: Partial<
    SellerProductsQuery &
      SellerOrdersQuery &
      SellerFinanceQuery &
      SellerPromotionsQuery &
      SellerChatQuery
  > = {},
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

  if (section === 'finance') {
    if (query.tab && query.tab !== 'wallet') params.set('tab', query.tab);
    if (query.month && query.month !== '2025-04') params.set('month', query.month);
  }

  if (section === 'promotions') {
    if (query.tab && query.tab !== 'all') params.set('tab', query.tab);
    if (query.range && query.range !== '2025-04') params.set('range', query.range);
  }

  if (section === 'chat') {
    if (query.tab && query.tab !== 'messages') params.set('tab', query.tab);
    if (query.inbox && query.inbox !== 'all') params.set('inbox', query.inbox);
    if (query.q?.trim()) params.set('q', query.q.trim());
    if (query.thread?.trim()) params.set('thread', query.thread.trim());
  }

  const qs = params.toString();
  return qs ? `/seller?${qs}` : '/seller?demo=registered';
}
