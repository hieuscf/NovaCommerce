'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

export function Header() {
  const t = useTranslations('nav');

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
        </nav>
      </div>
    </header>
  );
}
