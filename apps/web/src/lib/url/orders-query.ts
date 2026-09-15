import {
  isOrderStatusFilter,
  type OrderStatusFilter,
} from '@/lib/view-models/order';

export interface OrdersQuery {
  readonly status: OrderStatusFilter;
  readonly page: number;
}

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function parsePage(value: string | undefined): number {
  const page = Number(value ?? '1');
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function parseOrdersQuery(searchParams: SearchParams): OrdersQuery {
  const status = first(searchParams.status)?.trim().toLowerCase();
  return {
    status: isOrderStatusFilter(status) ? status : 'all',
    page: parsePage(first(searchParams.page)?.trim()),
  };
}

export function toOrdersSearchParams(query: OrdersQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.status !== 'all') {
    params.set('status', query.status);
  }
  if (query.page > 1) {
    params.set('page', String(query.page));
  }
  return params;
}

export function ordersHref(query: OrdersQuery): string {
  const qs = toOrdersSearchParams(query).toString();
  return qs ? `/orders?${qs}` : '/orders';
}
