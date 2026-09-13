import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Persistent, in-page message. Use `Toast` for transient feedback about an
 * action the user just took.
 */
const alertVariants = cva(
  'relative flex w-full gap-3 rounded-xl border px-4 py-3.5 text-body-sm [&_svg:not([class*="size-"])]:size-5 [&_svg]:mt-0.5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface text-foreground [&_svg]:text-muted-foreground',
        info: 'border-info/25 bg-info/8 text-foreground [&_svg]:text-info',
        success: 'border-success/25 bg-success/8 text-foreground [&_svg]:text-success',
        warning: 'border-warning/30 bg-warning/10 text-foreground [&_svg]:text-warning',
        destructive:
          'border-destructive/25 bg-destructive/8 text-foreground [&_svg]:text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface AlertProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof alertVariants> {}

function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div
      data-slot="alert"
      // `destructive` and `warning` carry urgency, so they interrupt; the rest
      // are announced politely when inserted.
      role={variant === 'destructive' || variant === 'warning' ? 'alert' : 'status'}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-content"
      className={cn('flex min-w-0 flex-1 flex-col gap-1', className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="alert-title"
      className={cn('font-semibold tracking-tight', className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn('text-muted-foreground [&_p]:leading-relaxed', className)}
      {...props}
    />
  );
}

function AlertActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-actions"
      className={cn('mt-2 flex flex-wrap items-center gap-2', className)}
      {...props}
    />
  );
}

export { Alert, AlertContent, AlertTitle, AlertDescription, AlertActions, alertVariants };
