import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';
import { Spinner } from './spinner';

const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl',
    'text-sm font-medium transition-all duration-fast focus-ring',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4',
  ],
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary-strong hover:shadow-md active:scale-[0.98]',
        'primary-gradient':
          'bg-gradient-hero text-primary-foreground shadow-md hover:opacity-95 hover:shadow-lg active:scale-[0.98]',
        secondary:
          'border border-border bg-surface text-foreground shadow-sm hover:border-primary/20 hover:bg-muted',
        soft: 'bg-accent-soft text-primary hover:bg-accent-soft/70',
        outline:
          'border border-border bg-transparent text-foreground hover:border-primary/30 hover:bg-muted',
        ghost: 'text-foreground hover:bg-muted hover:text-foreground',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        link: 'text-primary underline-offset-4 hover:underline',
        dark: 'bg-dark-surface text-dark-foreground hover:bg-dark-surface-secondary',
      },
      size: {
        default: 'h-11 min-h-11 px-5 py-2',
        sm: 'h-9 min-h-9 rounded-lg px-3.5 text-xs',
        lg: 'h-12 min-h-12 rounded-xl px-7 text-base',
        icon: 'size-11 min-h-11 min-w-11',
        'icon-sm': 'size-9 min-h-9 min-w-9 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  /** Announced to assistive tech while `loading` is true. */
  loadingLabel?: string;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  loadingLabel = 'Loading',
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  const isDisabled = disabled || loading;

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      // `disabled` is only valid on <button>; when composing (e.g. with a
      // Next.js Link) fall back to the ARIA equivalent.
      {...(asChild
        ? { 'aria-disabled': isDisabled || undefined, 'data-disabled': isDisabled || undefined }
        : { disabled: isDisabled })}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <Spinner className="size-4" />
          <span className="sr-only">{loadingLabel}</span>
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
