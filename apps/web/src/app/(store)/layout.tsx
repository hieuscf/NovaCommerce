import { StorefrontLayout } from '@/components/layout/storefront-layout';

export default function StoreRouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <StorefrontLayout>{children}</StorefrontLayout>;
}
