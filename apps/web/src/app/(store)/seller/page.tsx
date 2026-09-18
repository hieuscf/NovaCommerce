import type { Metadata } from 'next';
import { SellerPage } from '@/components/seller/seller-page';
import { getSellerPage, getSellerPageStatus } from '@/lib/seller/get-seller-page';
import {
  parseSellerChatQuery,
  parseSellerFinanceQuery,
  parseSellerOrdersQuery,
  parseSellerProductsQuery,
  parseSellerPromotionsQuery,
  parseSellerWorkspaceSection,
} from '@/lib/url/seller-workspace-query';

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
  const section = parseSellerWorkspaceSection(params);
  const productsQuery = parseSellerProductsQuery(params);
  const ordersQuery = parseSellerOrdersQuery(params);
  const financeQuery = parseSellerFinanceQuery(params);
  const promotionsQuery = parseSellerPromotionsQuery(params);
  const chatQuery = parseSellerChatQuery(params);
  return (
    <SellerPage
      page={getSellerPage(status)}
      section={section}
      productsQuery={productsQuery}
      ordersQuery={ordersQuery}
      financeQuery={financeQuery}
      promotionsQuery={promotionsQuery}
      chatQuery={chatQuery}
    />
  );
}
