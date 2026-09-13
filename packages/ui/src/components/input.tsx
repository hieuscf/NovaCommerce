import * as React from 'react';
import { cn } from '../lib/utils';

/**
 * Error styling is driven by `aria-invalid` rather than a boolean prop, so the
 * visual state can never drift from what assistive technology reports.
 */
const inputBase = [
  'flex h-11 w-full min-w-0 rounded-xl border border-input bg-surface px-4 py-2',
  'text-body-sm text-foreground shadow-sm transition-colors duration-fast',
  'placeholder:text-muted-foreground',
  'disabled:cursor-not-allowed disabled:opacity-50',
];

/** Applied only when the input renders its own border and focus ring. */
const inputStandalone = [
  'focus-ring',
  'aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive',
];

export interface InputProps extends React.ComponentProps<'input'> {
  /** Decorative or interactive content pinned to the leading edge. */
  startAdornment?: React.ReactNode;
  /** Decorative or interactive content pinned to the trailing edge. */
  endAdornment?: React.ReactNode;
  /** Classes for the bordered wrapper when an adornment is present. */
  groupClassName?: string;
}

function Input({ className, type, startAdornment, endAdornment, groupClassName, ...props }: InputProps) {
  const hasAdornment = Boolean(startAdornment || endAdornment);

  const input = (
    <input
      type={type}
      data-slot="input"
      className={cn(
        inputBase,
        // The wrapper owns the border, ring and side padding when adorned.
        hasAdornment
          ? 'border-transparent bg-transparent shadow-none outline-none'
          : inputStandalone,
        startAdornment && 'pl-2',
        endAdornment && 'pr-2',
        className,
      )}
      {...props}
    />
  );

  if (!hasAdornment) {
    return input;
  }

  return (
    <div
      data-slot="input-group"
      className={cn(
        'flex w-full items-center rounded-xl border border-input bg-surface shadow-sm transition-colors duration-fast',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
        'has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50',
        'has-[input[aria-invalid="true"]]:border-destructive',
        'has-[input[aria-invalid="true"]]:focus-within:ring-destructive',
        groupClassName,
      )}
    >
      {startAdornment ? (
        <span
          data-slot="input-start-adornment"
          className="flex shrink-0 items-center pl-4 text-muted-foreground [&_svg:not([class*='size-'])]:size-4"
        >
          {startAdornment}
        </span>
      ) : null}
      {input}
      {endAdornment ? (
        <span
          data-slot="input-end-adornment"
          className="flex shrink-0 items-center pr-4 text-muted-foreground [&_svg:not([class*='size-'])]:size-4"
        >
          {endAdornment}
        </span>
      ) : null}
    </div>
  );
}

export { Input };
