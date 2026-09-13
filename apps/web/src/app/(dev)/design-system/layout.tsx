import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isDesignSystemRouteEnabled } from '@/lib/design-system-route';

export const metadata: Metadata = {
  title: 'Design System',
  robots: { index: false, follow: false },
};

export default function DesignSystemLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!isDesignSystemRouteEnabled()) {
    notFound();
  }

  return children;
}
