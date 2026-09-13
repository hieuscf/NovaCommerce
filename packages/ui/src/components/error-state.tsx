import * as React from 'react';
import { cn } from '../lib/utils';

export interface ErrorStateProps {
  icon?: React.ReactNode;
  /** Plain-language summary. Never surface stack traces or internal codes. */
  title: string;
  description?: string;
  /** Primary recovery affordance, typically a retry. */
  action?: React.ReactNode;
  /** Optional escape hatch, e.g. "Back to home" or "Contact support". */
  secondaryAction?: React.ReactNode;
  tone?: 'danger' | 'neutral';
  className?: string;
}

function ErrorState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  tone = 'danger',
  className,
}: ErrorStateProps) {
  return (
    <div
      data-slot="error-state"
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border px-6 py-16 text-center',
        tone === 'danger'
          ? 'border-destructive/20 bg-destructive/5'
          : 'border-border bg-surface-subtle',
        className,
      )}
    >
      {icon ? (
        <div
          className={cn(
            'mb-4 flex size-14 items-center justify-center rounded-2xl',
            tone === 'danger'
              ? 'bg-destructive/10 text-destructive-strong'
              : 'bg-accent-soft text-primary',
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      ) : null}
      <h2 className="text-h4 text-foreground">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-sm text-body-sm text-muted-foreground">{description}</p>
      ) : null}
      {action || secondaryAction ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}

export { ErrorState };
