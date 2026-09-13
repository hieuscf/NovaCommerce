import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Skeleton } from '@novacommerce/ui/components/skeleton';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthLayout } from '@/components/auth/auth-layout';
import { VerifyEmailCard, type VerificationStatus } from '@/components/auth/verify-email-card';

export const metadata: Metadata = {
  title: 'Verify Email',
  description: 'Verify your NovaCommerce account email address.',
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: VerificationStatus }>;
}) {
  const { status } = await searchParams;

  return (
    <AuthLayout>
      <Suspense
        fallback={
          <AuthCard title="Verify your email" description="Loading verification status...">
            <Skeleton className="h-32 w-full" />
          </AuthCard>
        }
      >
        <VerifyEmailCard initialStatus={status} />
      </Suspense>
    </AuthLayout>
  );
}
