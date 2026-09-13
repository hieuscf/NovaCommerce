import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Compact status/metadata label. Commerce variants (`promo`, `bestseller`,
 * `sale`) carry the storefront's merchandising language; the neutral and
 * semantic variants are shared with Admin.
 */
const badgeVariants = cva(
  [
    'inline-flex w-fit shrink-0 items-center gap-1 rounded-pill border px-2.5 py-0.5',
    'text-caption font-medium whitespace-nowrap transition-colors duration-fast',
    '[&_svg:not([class*="size-"])]:size-3',
  ],
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-accent-soft text-primary',
        outline: 'border-border text-foreground',
        success: 'border-transparent bg-success/12 text-success-strong',
        warning: 'border-transparent bg-warning/15 text-warning-strong',
        destructive: 'border-transparent bg-destructive/12 text-destructive-strong',
        info: 'border-transparent bg-info/12 text-info-strong',
        promo: 'border-transparent bg-gradient-hero text-primary-foreground',
        bestseller: 'border-transparent bg-warning/15 text-warning-strong',
        sale: 'border-transparent bg-secondary/12 text-secondary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.ComponentProps<'span'>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
