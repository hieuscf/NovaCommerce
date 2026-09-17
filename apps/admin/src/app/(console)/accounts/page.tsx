import type { Metadata } from 'next';
import { AccountsPage } from '@/components/accounts/accounts-page';
import { parseAccountsQuery } from '@/lib/url/accounts-query';

export const metadata: Metadata = {
  title: 'Accounts',
};

type AccountsRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AccountsRoute({ searchParams }: AccountsRouteProps) {
  const params = await searchParams;
  const query = parseAccountsQuery(params);
  return <AccountsPage query={query} />;
}
