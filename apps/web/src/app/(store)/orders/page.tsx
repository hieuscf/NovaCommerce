import type { Metadata } from 'next';
import { OrderListContainer } from '@/components/commerce/orders/order-list-container';
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

  return <OrderListContainer query={query} />;
}
