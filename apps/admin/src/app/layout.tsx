import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AdminProviders } from '@/components/providers/admin-providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'NovaCommerce Admin',
    template: '%s | NovaCommerce Admin',
  },
  description: 'NovaCommerce administration console',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AdminProviders>{children}</AdminProviders>
      </body>
    </html>
  );
}
