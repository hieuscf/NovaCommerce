import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AccountDashboard } from '@/components/account/account-dashboard';
import { RequireAuth } from '@/features/auth/require-auth';
import { parseAccountQuery } from '@/lib/url/account-query';

export const metadata: Metadata = {
  title: 'Account',
  robots: { index: false, follow: false },
};

interface AccountPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const query = parseAccountQuery(await searchParams);

  if (query.section === 'orders') {
    redirect('/orders');
  }

  return (
    <RequireAuth>
      <AccountDashboard section={query.section} />
    </RequireAuth>
  );
}
