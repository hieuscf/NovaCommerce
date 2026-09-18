export type SearchParams = Record<string, string | string[] | undefined>;

export type OrdersStatusFilter =
  | 'all'
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type OrdersPaymentFilter = 'all' | 'paid' | 'pending' | 'failed' | 'refunded';

export type OrdersDateRangeFilter = 'last_7_days' | 'last_30_days' | 'last_90_days' | 'all';

export interface OrdersQuery {
  q?: string;
  status: OrdersStatusFilter;
  payment: OrdersPaymentFilter;
  range: OrdersDateRangeFilter;
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

function parseStatus(raw: string | undefined): OrdersStatusFilter {
  if (
    raw === 'pending' ||
    raw === 'processing' ||
    raw === 'shipped' ||
    raw === 'delivered' ||
    raw === 'cancelled'
  ) {
    return raw;
  }
  return 'all';
}

function parsePayment(raw: string | undefined): OrdersPaymentFilter {
  if (raw === 'paid' || raw === 'pending' || raw === 'failed' || raw === 'refunded') {
    return raw;
  }
  return 'all';
}

function parseRange(raw: string | undefined): OrdersDateRangeFilter {
  if (raw === 'last_7_days' || raw === 'last_90_days' || raw === 'all') return raw;
  return 'last_30_days';
}

export function parseOrdersQuery(searchParams: SearchParams): OrdersQuery {
  return {
    q: first(searchParams.q)?.trim() || undefined,
    status: parseStatus(first(searchParams.status)?.trim().toLowerCase()),
    payment: parsePayment(first(searchParams.payment)?.trim().toLowerCase()),
    range: parseRange(first(searchParams.range)?.trim().toLowerCase()),
    page: parsePage(first(searchParams.page)?.trim()),
  };
}

export function ordersHref(query: Partial<OrdersQuery>): string {
  const params = new URLSearchParams();
  if (query.q?.trim()) params.set('q', query.q.trim());
  if (query.status && query.status !== 'all') params.set('status', query.status);
  if (query.payment && query.payment !== 'all') params.set('payment', query.payment);
  if (query.range && query.range !== 'last_30_days') params.set('range', query.range);
  if (query.page && query.page > 1) params.set('page', String(query.page));
  const qs = params.toString();
  return qs ? `/orders?${qs}` : '/orders';
}
