import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Shape the skeleton like the content it stands in for — a skeleton that does
 * not match its final layout causes a visible jump on load.
 */
const skeletonVariants = cva('animate-shimmer bg-muted', {
  variants: {
    variant: {
      /** Generic block: cards, images, media wells. */
      block: 'rounded-xl',
      /** Single line of text; pair with a width class. */
      text: 'h-4 rounded-sm',
      /** Avatars and icon buttons. */
      circle: 'rounded-pill',
    },
  },
  defaultVariants: {
    variant: 'block',
  },
});

export interface SkeletonProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    />
  );
}

export interface SkeletonTextProps extends React.ComponentProps<'div'> {
  /** Number of lines to render. The last line is shortened. */
  lines?: number;
}

function SkeletonText({ className, lines = 3, ...props }: SkeletonTextProps) {
  return (
    <div data-slot="skeleton-text" className={cn('grid gap-2', className)} {...props}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          variant="text"
          className={index === lines - 1 ? 'w-2/3' : 'w-full'}
        />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonText, skeletonVariants };
