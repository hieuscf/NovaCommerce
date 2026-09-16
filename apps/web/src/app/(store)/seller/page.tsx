import type { Metadata } from 'next';
import { SellerPage } from '@/components/seller/seller-page';
import { getSellerPage } from '@/lib/seller/get-seller-page';

export const metadata: Metadata = {
  title: 'Become a Seller',
  description:
    'Start selling on NovaCommerce. Register your business, set up your shop, and reach millions of customers.',
};

export default function SellerRoutePage() {
  return <SellerPage page={getSellerPage()} />;
}
