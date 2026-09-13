'use client';

import { TooltipProvider } from '@novacommerce/ui/components/tooltip';
import { Toaster } from '@novacommerce/ui/components/toast';

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      {children}
      <Toaster />
    </TooltipProvider>
  );
}
