import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Skeleton } from '@novacommerce/ui/components/skeleton';
import { LoginForm } from '@/components/auth/login-form';
import { LoginShell } from '@/components/auth/login-shell';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your NovaCommerce account.',
};

export default function LoginPage() {
  return (
    <LoginShell>
      <Suspense
        fallback={
          <div className="space-y-5">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </LoginShell>
  );
}
