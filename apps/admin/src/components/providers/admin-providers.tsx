'use client';

import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@novacommerce/ui/components/tooltip';
import { Toaster } from '@novacommerce/ui/components/toast';

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}
