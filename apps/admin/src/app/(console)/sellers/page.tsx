import type { Metadata } from 'next';
import { SellersPage } from '@/components/sellers/sellers-page';
import { parseSellersQuery } from '@/lib/url/sellers-query';

export const metadata: Metadata = {
  title: 'Sellers',
};

type SellersRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SellersRoute({ searchParams }: SellersRouteProps) {
  const params = await searchParams;
  const query = parseSellersQuery(params);
  return <SellersPage query={query} />;
}
