import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Skeleton } from '@novacommerce/ui/components/skeleton';
import { AuthSplitShell } from '@/components/auth/auth-split-shell';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create your NovaCommerce account.',
};

export default function RegisterPage() {
  return (
    <AuthSplitShell
      align="start"
      title={
        <>
          Create Your Account at
          <br />
          <span className="text-gradient-hero">NovaCommerce</span>
        </>
      }
      description="Join a trusted marketplace. Create a free account to save favorites, track orders, and shop smarter."
    >
      <Suspense
        fallback={
          <div className="space-y-5">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </AuthSplitShell>
  );
}
