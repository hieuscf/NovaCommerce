import type { Metadata } from 'next';
import { AdminLoginForm } from '@/components/auth/admin-login-form';
import { AdminLoginShell } from '@/components/auth/admin-login-shell';
import { getSafeAuthReturnUrl } from '@/lib/auth/return-url';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to the NovaCommerce admin console.',
};

type LoginRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function AdminLoginPage({ searchParams }: LoginRouteProps) {
  const params = await searchParams;
  const returnUrl = getSafeAuthReturnUrl({
    get: (name) => first(params[name]),
  });
  const reason = first(params.reason);

  return (
    <AdminLoginShell>
      <AdminLoginForm returnUrl={returnUrl} reason={reason} />
    </AdminLoginShell>
  );
}
