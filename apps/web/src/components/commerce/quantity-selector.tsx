'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  id?: string;
  labelledBy?: string;
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  id = 'quantity',
  labelledBy,
  className,
}: QuantitySelectorProps) {
  const atMin = value <= min;
  const atMax = value >= max;

  function setValue(next: number) {
    const clamped = Math.min(max, Math.max(min, next));
    if (clamped !== value) {
      onChange(clamped);
    }
  }

  return (
    <div
      className={cn(
        'inline-flex h-11 items-center rounded-xl border border-border bg-surface',
        disabled && 'opacity-50',
        className,
      )}
    >
      <button
        type="button"
        className="grid size-11 place-items-center rounded-l-xl text-foreground transition-colors duration-fast hover:bg-muted focus-ring disabled:pointer-events-none disabled:text-muted-foreground"
        onClick={() => setValue(value - 1)}
        disabled={disabled || atMin}
        aria-label="Decrease quantity"
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        aria-labelledby={labelledBy}
        aria-live="polite"
        className="h-11 w-12 border-x border-border bg-transparent text-center text-sm font-semibold text-foreground outline-none focus-ring"
        value={value}
        disabled={disabled}
        onChange={(event) => {
          const next = Number.parseInt(event.target.value.replace(/\D/g, ''), 10);
          if (Number.isFinite(next)) {
            setValue(next);
          }
        }}
        onBlur={() => {
          if (!Number.isFinite(value) || value < min) {
            setValue(min);
          }
        }}
      />
      <button
        type="button"
        className="grid size-11 place-items-center rounded-r-xl text-foreground transition-colors duration-fast hover:bg-muted focus-ring disabled:pointer-events-none disabled:text-muted-foreground"
        onClick={() => setValue(value + 1)}
        disabled={disabled || atMax}
        aria-label="Increase quantity"
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
