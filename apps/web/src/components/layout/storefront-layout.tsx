'use client';

import { usePathname } from 'next/navigation';
import { SiteFooter } from '@/components/navigation/site-footer';
import { SiteHeader } from '@/components/navigation/site-header';
import { ProtectedRoutes } from '@/features/auth/protected-routes';

export function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSellerCenter = pathname === '/seller' || pathname.startsWith('/seller/');

  if (isSellerCenter) {
    return <ProtectedRoutes>{children}</ProtectedRoutes>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <ProtectedRoutes>{children}</ProtectedRoutes>
      </main>
      <SiteFooter />
    </div>
  );
}
