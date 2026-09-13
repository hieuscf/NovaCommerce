'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuthCard } from './auth-card';
import { AuthErrorMessage } from './auth-error';
import { AuthSuccessMessage } from './auth-success';

export type VerificationStatus = 'pending' | 'success' | 'expired' | 'failed';

export interface VerifyEmailCardProps {
  initialStatus?: VerificationStatus;
}

const statusContent: Record<
  VerificationStatus,
  { title: string; description: string; content: React.ReactNode }
> = {
  pending: {
    title: 'Check your email',
    description: "We've sent a verification link to your email address.",
    content: (
      <AuthSuccessMessage
        title="Verification pending"
        message="Click the link in your email to complete your registration. If you don't see it, check your spam folder."
      />
    ),
  },
  success: {
    title: 'Email verified',
    description: 'Your email has been successfully verified.',
    content: (
      <AuthSuccessMessage
        title="Welcome to NovaCommerce"
        message="Your account is ready. You can now sign in."
      />
    ),
  },
  expired: {
    title: 'Verification expired',
    description: 'The verification link has expired or is no longer valid.',
    content: (
      <AuthErrorMessage message="The verification link has expired. Please request a new one during sign in or contact support." />
    ),
  },
  failed: {
    title: 'Verification failed',
    description: 'We could not verify your email address.',
    content: (
      <AuthErrorMessage message="The verification link is invalid or has already been used. Please try again or contact support." />
    ),
  },
};

export function VerifyEmailCard({ initialStatus = 'pending' }: VerifyEmailCardProps) {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status') as VerificationStatus | null;
  const status = statusParam && statusParam in statusContent ? statusParam : initialStatus;
  const { title, description, content } = statusContent[status];

  return (
    <AuthCard
      title={title}
      description={description}
      footer={
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>{' '}
          ·{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create account
          </Link>
        </p>
      }
    >
      <div className="space-y-5">{content}</div>
    </AuthCard>
  );
}
