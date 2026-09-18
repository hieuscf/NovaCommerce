import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AccountsPage } from '@/components/accounts/accounts-page';
import {
  accountsHref,
  hasRemovedAccountsRoleParam,
  parseAccountsQuery,
} from '@/lib/url/accounts-query';

export const metadata: Metadata = {
  title: 'Accounts',
};

type AccountsRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AccountsRoute({ searchParams }: AccountsRouteProps) {
  const params = await searchParams;
  const query = parseAccountsQuery(params);
  if (hasRemovedAccountsRoleParam(params)) {
    redirect(accountsHref(query));
  }
  return <AccountsPage query={query} />;
}
