'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

/**
 * Density is provided by `Table` and consumed by cells, so a table's rhythm is
 * set in one place. Admin data grids default to `dense`; customer-facing
 * tables should stay `comfortable`.
 */
type TableDensity = 'comfortable' | 'dense';

const TableDensityContext = React.createContext<TableDensity>('comfortable');

const cellPadding: Record<TableDensity, string> = {
  comfortable: 'px-4 py-4',
  dense: 'px-3 py-2',
};

export interface TableProps extends React.ComponentProps<'table'> {
  density?: TableDensity;
}

function Table({ className, density = 'comfortable', ...props }: TableProps) {
  return (
    <TableDensityContext.Provider value={density}>
      {/* Horizontal scroll keeps wide tables from overflowing the viewport. */}
      <div
        data-slot="table-container"
        className="w-full overflow-x-auto rounded-2xl border border-border bg-card"
      >
        <table
          data-slot="table"
          data-density={density}
          className={cn('w-full caption-bottom border-collapse text-body-sm', className)}
          {...props}
        />
      </div>
    </TableDensityContext.Provider>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn('[&_tr]:border-b [&_tr]:border-border', className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('border-t border-border bg-surface-subtle font-medium', className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-b border-border transition-colors duration-fast',
        'hover:bg-surface-subtle',
        'data-[state=selected]:bg-accent-soft/60',
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  const density = React.useContext(TableDensityContext);

  return (
    <th
      data-slot="table-head"
      scope="col"
      className={cn(
        cellPadding[density],
        'bg-surface-subtle text-left align-middle text-caption font-semibold tracking-wide text-muted-foreground uppercase',
        'whitespace-nowrap',
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  const density = React.useContext(TableDensityContext);

  return (
    <td
      data-slot="table-cell"
      className={cn(cellPadding[density], 'align-middle text-foreground', className)}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('mt-4 text-caption text-muted-foreground', className)}
      {...props}
    />
  );
}

export interface TableEmptyProps extends React.ComponentProps<'td'> {
  colSpan: number;
}

/** Full-width row for the empty result set. */
function TableEmpty({ className, colSpan, children, ...props }: TableEmptyProps) {
  return (
    <tr data-slot="table-empty">
      <td
        colSpan={colSpan}
        className={cn('px-4 py-14 text-center text-body-sm text-muted-foreground', className)}
        {...props}
      >
        {children}
      </td>
    </tr>
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  TableEmpty,
};
