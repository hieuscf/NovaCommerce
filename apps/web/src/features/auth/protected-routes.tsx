'use client';

import { usePathname } from 'next/navigation';
import { isProtectedRoute } from '@/lib/auth/route-policy';
import { RequireAuth } from './require-auth';

/**
 * Applies the centralized customer protected-route policy.
 * UX only — Identity / Gateway remain the authorization boundary.
 */
export function ProtectedRoutes({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (!isProtectedRoute(pathname)) {
    return children;
  }

  return <RequireAuth>{children}</RequireAuth>;
}
