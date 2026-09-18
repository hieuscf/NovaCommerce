import type { Metadata } from 'next';
import { SellerPage } from '@/components/seller/seller-page';
import { getSellerPage, getSellerPageStatus } from '@/lib/seller/get-seller-page';

export const metadata: Metadata = {
  title: 'Seller Center',
  description:
    'Start selling on NovaCommerce. Register your business, set up your shop, and manage your seller workspace.',
};

type SellerRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SellerRoutePage({ searchParams }: SellerRouteProps) {
  const params = await searchParams;
  const status = getSellerPageStatus(params);
  return <SellerPage page={getSellerPage(status)} />;
}
