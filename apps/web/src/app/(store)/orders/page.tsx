import type { Metadata } from 'next';
import { OrderListPage } from '@/components/commerce/orders/order-list-page';
import { getOrderListPage } from '@/lib/orders/get-order-list';
import { parseOrdersQuery } from '@/lib/url/orders-query';

export const metadata: Metadata = {
  title: 'My Orders',
  description: 'Track and manage your NovaCommerce orders.',
  robots: { index: false, follow: false },
};

interface OrdersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const query = parseOrdersQuery(await searchParams);
  const list = getOrderListPage(query);

  return <OrderListPage list={list} query={query} />;
}
