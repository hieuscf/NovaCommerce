'use client';

import * as React from 'react';
import { Toaster as SonnerToaster, toast } from 'sonner';

/**
 * Transient feedback surface. Mount once per application, near the root.
 * Use `Alert` for messages that should persist in the page.
 *
 * Variants map onto Sonner's helpers: `toast.success`, `toast.info`,
 * `toast.warning`, `toast.error`.
 */
function Toaster({
  position = 'bottom-right',
  ...props
}: React.ComponentProps<typeof SonnerToaster>) {
  return (
    <SonnerToaster
      data-slot="toaster"
      position={position}
      // Sonner renders into a portal, so tokens are applied via classNames
      // rather than inherited from an ancestor.
      toastOptions={{
        classNames: {
          toast:
            'group w-full items-start gap-3 rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-lg',
          title: 'text-body-sm font-semibold tracking-tight',
          description: 'text-caption text-muted-foreground',
          actionButton:
            'rounded-lg bg-primary px-3 py-1.5 text-caption font-medium text-primary-foreground transition-colors duration-fast hover:bg-primary-strong focus-ring',
          cancelButton:
            'rounded-lg bg-muted px-3 py-1.5 text-caption font-medium text-foreground transition-colors duration-fast hover:bg-border focus-ring',
          closeButton:
            'border-border bg-surface text-muted-foreground transition-colors duration-fast hover:text-foreground focus-ring',
          success: '[&_[data-icon]]:text-success',
          info: '[&_[data-icon]]:text-info',
          warning: '[&_[data-icon]]:text-warning',
          error: '[&_[data-icon]]:text-destructive',
        },
      }}
      {...props}
    />
  );
}

export { Toaster, toast };
