import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { Footer } from '@/components/common/footer';
import { Header } from '@/components/common/header';
import { Providers } from '@/components/common/providers';
import { CartDrawer } from '@/components/store/cart-drawer';
import { routing } from '@/i18n/routing';

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: { locale: string };
};

export async function generateMetadata({
  params: { locale },
}: LocaleLayoutProps): Promise<Metadata> {
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'common' });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  return {
    title: t('welcome'),
    description: t('search'),
    openGraph: {
      title: t('welcome'),
      description: t('search'),
      url: `${appUrl}/${locale}`,
      siteName: 'NovaCommerce Web Store',
      images: [
        {
          url: `${appUrl}/og-default.png`,
          width: 1200,
          height: 630,
          alt: 'NovaCommerce Web Store',
        },
      ],
      locale,
      type: 'website',
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="container mx-auto w-full flex-1 px-4 py-6">
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </div>
      </Providers>
    </NextIntlClientProvider>
  );
}
