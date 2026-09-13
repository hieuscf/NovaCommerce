import * as React from 'react';
import { cn } from '../lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-24 w-full resize-y rounded-xl border border-input bg-surface px-4 py-3',
        'text-body-sm text-foreground shadow-sm transition-colors duration-fast',
        'placeholder:text-muted-foreground focus-ring',
        'disabled:cursor-not-allowed disabled:resize-none disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive',
        'field-sizing-content',
        className,
      )}
      {...props}
    />
  );
}

export interface CharacterCountProps extends React.ComponentProps<'p'> {
  value: string;
  maxLength: number;
}

/**
 * Optional companion for `Textarea`. Kept separate so the textarea stays an
 * uncontrolled-friendly primitive.
 */
function CharacterCount({ className, value, maxLength, ...props }: CharacterCountProps) {
  const over = value.length > maxLength;

  return (
    <p
      data-slot="character-count"
      aria-live="polite"
      className={cn(
        'text-caption tabular-nums',
        over ? 'text-destructive' : 'text-muted-foreground',
        className,
      )}
      {...props}
    >
      {value.length}/{maxLength}
    </p>
  );
}

export { Textarea, CharacterCount };
