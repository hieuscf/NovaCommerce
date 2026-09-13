import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * Presentational only — it never fetches. Consumers supply `href`s (for
 * URL-driven page state) or `onClick` handlers, and compose with their own
 * link component via `asChild`.
 */
export type PaginationItemValue = number | 'ellipsis';

const range = (start: number, end: number): number[] =>
  Array.from({ length: end - start + 1 }, (_, index) => start + index);

/**
 * Builds the visible page list with leading/trailing ellipses.
 *
 * The returned length is constant once `totalPages` exceeds what fits, so the
 * control does not change width as the user pages through — near either end
 * the window extends inwards instead of shrinking.
 *
 * Pure and deterministic, so it can be unit tested and reused on the server.
 */
function getPaginationRange({
  page,
  totalPages,
  siblingCount = 1,
}: {
  page: number;
  totalPages: number;
  siblingCount?: number;
}): PaginationItemValue[] {
  if (totalPages <= 0) {
    return [];
  }

  // First, last, current, both siblings, and both ellipsis slots.
  const maxVisible = siblingCount * 2 + 5;

  if (totalPages <= maxVisible) {
    return range(1, totalPages);
  }

  const current = Math.min(Math.max(page, 1), totalPages);
  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, totalPages);

  // An ellipsis is only worth showing when it hides more than one page.
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;
  const edgeWindow = siblingCount * 2 + 3;

  if (!showLeftEllipsis && showRightEllipsis) {
    return [...range(1, edgeWindow), 'ellipsis', totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    return [1, 'ellipsis', ...range(totalPages - edgeWindow + 1, totalPages)];
  }

  return [1, 'ellipsis', ...range(leftSibling, rightSibling), 'ellipsis', totalPages];
}

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      data-slot="pagination"
      role="navigation"
      aria-label="Pagination"
      className={cn('flex w-full justify-center', className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('flex flex-row items-center gap-1', className)}
      {...props}
    />
  );
}

function PaginationItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" className={cn('flex', className)} {...props} />;
}

const linkBase = [
  'inline-flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-lg px-3',
  'text-body-sm font-medium transition-colors duration-fast focus-ring',
  '[&_svg:not([class*="size-"])]:size-4',
];

export interface PaginationLinkProps extends React.ComponentProps<'a'> {
  isActive?: boolean;
  asChild?: boolean;
}

function PaginationLink({ className, isActive, asChild, ...props }: PaginationLinkProps) {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      data-slot="pagination-link"
      aria-current={isActive ? 'page' : undefined}
      data-active={isActive || undefined}
      className={cn(
        linkBase,
        isActive
          ? 'border border-primary/20 bg-accent-soft text-primary'
          : 'text-foreground hover:bg-muted',
        className,
      )}
      {...props}
    />
  );
}

export interface PaginationNavProps extends PaginationLinkProps {
  disabled?: boolean;
  /** Hide the text label below `sm`, keeping only the chevron. */
  label?: string;
}

function PaginationPrevious({
  className,
  disabled,
  label = 'Previous',
  ...props
}: PaginationNavProps) {
  return (
    <PaginationLink
      aria-label={label}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      className={cn('gap-1 pr-3.5 pl-2.5', disabled && 'pointer-events-none opacity-50', className)}
      {...props}
    >
      <ChevronLeftIcon aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </PaginationLink>
  );
}

function PaginationNext({ className, disabled, label = 'Next', ...props }: PaginationNavProps) {
  return (
    <PaginationLink
      aria-label={label}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      className={cn('gap-1 pr-2.5 pl-3.5', disabled && 'pointer-events-none opacity-50', className)}
      {...props}
    >
      <span className="hidden sm:inline">{label}</span>
      <ChevronRightIcon aria-hidden="true" />
    </PaginationLink>
  );
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="pagination-ellipsis"
      aria-hidden="true"
      className={cn('flex h-10 min-w-10 items-center justify-center text-muted-foreground', className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  getPaginationRange,
};
