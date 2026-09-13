import * as React from 'react';
import { cn } from '../lib/utils';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * "Nothing here yet" — not an error. Keep the tone neutral and, where it
 * helps, offer the action that would populate the surface.
 */
function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-subtle px-6 py-16 text-center',
        className,
      )}
    >
      {icon ? (
        <div
          className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-primary"
          aria-hidden="true"
        >
          {icon}
        </div>
      ) : null}
      <h3 className="text-h4 text-foreground">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-body-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export { EmptyState };
