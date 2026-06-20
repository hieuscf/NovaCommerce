import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  ),
  title: {
    default: 'NovaCommerce Web Store',
    template: '%s | NovaCommerce',
  },
  description:
    'Nen tang thuong mai dien tu NovaCommerce danh cho khach hang mua sam.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? 'vi'}
      suppressHydrationWarning
    >
      <body className={inter.className}>{children}</body>
    </html>
  );
}
