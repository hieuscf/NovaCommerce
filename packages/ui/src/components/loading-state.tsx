import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';
import { Spinner } from './spinner';

const loadingStateVariants = cva('flex items-center text-muted-foreground', {
  variants: {
    variant: {
      /** Sits in a sentence or beside other inline content. */
      inline: 'gap-2 text-body-sm',
      /** Fills a card or content section. */
      section: 'min-h-56 flex-col justify-center gap-3 text-body-sm',
      /** Fills the viewport below the app chrome. */
      page: 'min-h-[60vh] flex-col justify-center gap-4 text-body',
    },
  },
  defaultVariants: {
    variant: 'section',
  },
});

const spinnerSize = {
  inline: 'sm',
  section: 'md',
  page: 'lg',
} as const;

export interface LoadingStateProps
  extends Omit<React.ComponentProps<'div'>, 'children'>,
    VariantProps<typeof loadingStateVariants> {
  /** Visible and announced description of what is loading. */
  label?: string;
}

/**
 * Spinner-based loading affordance. Prefer `Skeleton` for content-heavy
 * surfaces where the final layout shape is known.
 */
function LoadingState({
  className,
  variant = 'section',
  label = 'Loading…',
  ...props
}: LoadingStateProps) {
  return (
    <div
      data-slot="loading-state"
      role="status"
      aria-live="polite"
      className={cn(loadingStateVariants({ variant }), className)}
      {...props}
    >
      <Spinner size={spinnerSize[variant ?? 'section']} className="text-primary" />
      <span>{label}</span>
    </div>
  );
}

export { LoadingState, loadingStateVariants };
