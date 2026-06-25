'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { useCartStore } from '@/lib/store/cart-store';
import { Button } from '@/components/ui/button';

export function Header() {
  const t = useTranslations('nav');
  const totalItems = useCartStore((state) => state.totalItems);
  const openDrawer = useCartStore((state) => state.openDrawer);

  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link className="font-semibold" href="/">
          NovaCommerce
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/">{t('home')}</Link>
          <Link href="/cart">{t('cart')}</Link>
          <Link href="/account">{t('account')}</Link>
          <Button onClick={openDrawer} size="sm" variant="outline">
            Gio hang ({totalItems})
          </Button>
        </nav>
      </div>
    </header>
  );
}
