import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AccountSettings } from '@/components/common/auth/account-settings';
import type { ApiEnvelope } from '@/types/api';
import type { AuthUser } from '@/types/auth';

type AccountPageProps = {
  params: { locale: string };
};

async function getCurrentUser(locale: string) {
  const cookieStore = cookies();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const response = await fetch(`${appUrl}/api/auth/me`, {
    headers: {
      Cookie: cookieStore.toString(),
    },
    cache: 'no-store',
  });

  const payload = (await response.json()) as ApiEnvelope<AuthUser>;

  if (!response.ok || payload.error || !payload.data) {
    redirect(`/${locale}/login?redirect=/${locale}/account`);
  }

  return payload.data;
}

export default async function AccountPage({ params }: AccountPageProps) {
  const user = await getCurrentUser(params.locale);

  return <AccountSettings user={user} />;
}
