'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoadingState } from '@novacommerce/ui/components/loading-state';
import { useAdminSession } from '@/features/auth/use-session';
import { buildLoginHref } from '@/lib/auth/return-url';
import { isAdminProtectedPath } from '@/lib/auth/route-policy';

/**
 * UX-only guard for the admin console. Gateway JWT remains authoritative.
 *
 * Renders a stable loading shell until after mount so SSR HTML matches the
 * first client paint (in-memory session is always empty on the server).
 */
export function RequireAdminAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdminSession();
  const router = useRouter();
  const pathname = usePathname();
  const protectedPath = isAdminProtectedPath(pathname);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !protectedPath || isAuthenticated) {
      return;
    }
    router.replace(buildLoginHref(pathname, 'session-required'));
  }, [ready, isAuthenticated, pathname, protectedPath, router]);

  if (!protectedPath) {
    return children;
  }

  if (!ready || !isAuthenticated) {
    return <LoadingState variant="section" label="Checking admin session" />;
  }

  return children;
}
