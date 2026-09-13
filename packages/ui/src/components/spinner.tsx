import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const spinnerVariants = cva('inline-block animate-spin rounded-pill border-current', {
  variants: {
    size: {
      sm: 'size-4 border-2',
      md: 'size-6 border-2',
      lg: 'size-9 border-[3px]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface SpinnerProps
  extends React.ComponentProps<'span'>,
    VariantProps<typeof spinnerVariants> {
  /**
   * Accessible name. Omit when the spinner sits inside an element that already
   * announces the busy state (e.g. `Button` with `loading`), so screen readers
   * do not hear it twice.
   */
  label?: string;
}

function Spinner({ className, size, label, ...props }: SpinnerProps) {
  return (
    <span
      data-slot="spinner"
      role={label ? 'status' : undefined}
      aria-hidden={label ? undefined : true}
      className={cn(spinnerVariants({ size }), 'border-t-transparent', className)}
      {...props}
    >
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}

export { Spinner, spinnerVariants };
