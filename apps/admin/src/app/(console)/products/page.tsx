import type { Metadata } from 'next';
import { ProductsPage } from '@/components/products/products-page';
import { parseProductsQuery } from '@/lib/url/products-query';

export const metadata: Metadata = {
  title: 'Products',
};

type ProductsRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductsRoute({ searchParams }: ProductsRouteProps) {
  const params = await searchParams;
  const query = parseProductsQuery(params);
  return <ProductsPage query={query} />;
}
