import type { Metadata } from 'next';
import { AccountSessionCard } from '@/components/auth/account-session-card';
import { RequireAuth } from '@/features/auth/require-auth';

export const metadata: Metadata = {
  title: 'Account',
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <RequireAuth>
      <AccountSessionCard />
    </RequireAuth>
  );
}
