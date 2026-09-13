'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingState } from '@novacommerce/ui/components/loading-state';
import { buildLoginHref } from '@/lib/auth/return-url';
import { useSession } from './use-session';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status, isAuthenticated, reason } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const resolving = status === 'unknown' || status === 'loading';

  useEffect(() => {
    if (resolving || isAuthenticated) {
      return;
    }
    router.replace(
      buildLoginHref(
        pathname,
        reason === 'session_expired' ? 'session-expired' : 'session-required',
      ),
    );
  }, [isAuthenticated, pathname, reason, resolving, router]);

  if (resolving) {
    return <LoadingState variant="section" label="Checking your session" />;
  }

  if (!isAuthenticated) {
    return <LoadingState variant="section" label="Redirecting to sign in" />;
  }

  return children;
}
