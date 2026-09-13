'use client';

import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@novacommerce/ui/components/tooltip';
import { Toaster } from '@novacommerce/ui/components/toast';
import { SessionBootstrap } from '@/features/auth/session-bootstrap';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    // `enableSystem` stays off until a dark palette ships — otherwise a
    // dark-OS visitor gets the `.dark` class with no dark tokens behind it.
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <TooltipProvider>
        <SessionBootstrap />
        {children}
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}
