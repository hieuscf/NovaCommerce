'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details
      open={open}
      className="group border-b border-border/70 py-4 last:border-b-0 last:pb-0"
      onToggle={(event) => {
        setOpen(event.currentTarget.open);
      }}
    >
      <summary
        className={cn(
          'flex cursor-pointer list-none items-center justify-between rounded-lg py-1 text-sm font-semibold text-foreground',
          'marker:content-none [&::-webkit-details-marker]:hidden',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
      >
        {title}
        <ChevronDown
          className={cn(
            'size-4 text-muted-foreground transition-transform duration-fast',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </summary>
      <div className="mt-3 space-y-1">{children}</div>
    </details>
  );
}
