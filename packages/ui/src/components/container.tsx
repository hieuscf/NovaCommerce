import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * The single source of page width and horizontal gutters. Pages should never
 * declare their own `max-w-*` + `px-*` pair.
 */
const containerVariants = cva('mx-auto w-full px-4 sm:px-6 lg:px-8', {
  variants: {
    size: {
      /** Reading width: articles, legal copy, single-column forms. */
      narrow: 'max-w-3xl',
      /** Default storefront and admin content width. */
      default: 'max-w-7xl',
      /** Full-bleed dashboards and wide data tables. */
      wide: 'max-w-wide',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export interface ContainerProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof containerVariants> {}

function Container({ className, size, ...props }: ContainerProps) {
  return (
    <div data-slot="container" className={cn(containerVariants({ size }), className)} {...props} />
  );
}

const sectionVariants = cva('', {
  variants: {
    spacing: {
      none: '',
      sm: 'py-8 sm:py-10',
      default: 'py-12 sm:py-16',
      lg: 'py-16 sm:py-24',
    },
  },
  defaultVariants: {
    spacing: 'default',
  },
});

export interface SectionProps
  extends React.ComponentProps<'section'>,
    VariantProps<typeof sectionVariants> {}

/** Vertical section rhythm, so page spacing stays on the same scale. */
function Section({ className, spacing, ...props }: SectionProps) {
  return (
    <section
      data-slot="section"
      className={cn(sectionVariants({ spacing }), className)}
      {...props}
    />
  );
}

export { Container, Section, containerVariants, sectionVariants };
