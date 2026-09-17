import type { Metadata } from 'next';
import { SellerApprovalsPage } from '@/components/sellers/seller-approvals-page';
import { parseApprovalsQuery } from '@/lib/url/approvals-query';

export const metadata: Metadata = {
  title: 'Seller Approvals',
};

type ApprovalsRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SellerApprovalsRoute({ searchParams }: ApprovalsRouteProps) {
  const params = await searchParams;
  const query = parseApprovalsQuery(params);
  return <SellerApprovalsPage query={query} />;
}
