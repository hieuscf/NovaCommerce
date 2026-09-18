import type { Metadata } from 'next';
import { OrdersPage } from '@/components/orders/orders-page';
import { parseOrdersQuery } from '@/lib/url/orders-query';

export const metadata: Metadata = {
  title: 'Orders',
};

type OrdersRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OrdersRoute({ searchParams }: OrdersRouteProps) {
  const params = await searchParams;
  const query = parseOrdersQuery(params);
  return <OrdersPage query={query} />;
}
