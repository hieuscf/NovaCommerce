'use client';

import Image from 'next/image';
import { Check } from 'lucide-react';
import type { ProductVariantGroupViewModel } from '@/lib/view-models/product-detail';
import { cn } from '@/lib/utils';

export interface VariantSelectorProps {
  groups: readonly ProductVariantGroupViewModel[];
  selected: Readonly<Record<string, string>>;
  onChange: (groupId: string, optionId: string) => void;
  disabled?: boolean;
  className?: string;
}

export function VariantSelector({
  groups,
  selected,
  onChange,
  disabled = false,
  className,
}: VariantSelectorProps) {
  if (groups.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-5', className)}>
      {groups.map((group) => {
        const selectedId = selected[group.id];

        return (
          <fieldset key={group.id} className="min-w-0" disabled={disabled}>
            <legend className="mb-3 text-sm font-semibold text-foreground">{group.name}</legend>
            <div
              className="flex flex-wrap gap-2.5"
              role="radiogroup"
              aria-label={group.name}
            >
              {group.options.map((option) => {
                const isSelected = option.id === selectedId;
                const unavailable = !option.available;

                if (group.type === 'image' && option.thumbnailUrl) {
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`${option.label}${unavailable ? ', unavailable' : ''}`}
                      disabled={unavailable || disabled}
                      onClick={() => onChange(group.id, option.id)}
                      className={cn(
                        'flex w-19 flex-col items-center gap-2 rounded-xl text-center focus-ring',
                        unavailable && 'cursor-not-allowed opacity-45',
                      )}
                    >
                      <span
                        className={cn(
                          'relative size-18 overflow-hidden rounded-2xl border-2 bg-surface-subtle transition-colors duration-fast',
                          isSelected ? 'border-primary shadow-sm' : 'border-transparent hover:border-primary/35',
                        )}
                      >
                        <Image
                          src={option.thumbnailUrl}
                          alt=""
                          fill
                          sizes="72px"
                          className="object-contain p-1.5"
                        />
                      </span>
                      <span
                        className={cn(
                          'text-[11px] leading-4',
                          isSelected ? 'font-semibold text-foreground' : 'text-muted-foreground',
                        )}
                      >
                        {option.label}
                      </span>
                    </button>
                  );
                }

                if (group.type === 'swatch' && option.swatch) {
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`${option.label}${unavailable ? ', unavailable' : ''}`}
                      disabled={unavailable || disabled}
                      onClick={() => onChange(group.id, option.id)}
                      className={cn(
                        'inline-flex h-11 items-center gap-2 rounded-full border bg-surface pr-3.5 pl-1.5 text-sm font-medium transition-colors duration-fast focus-ring',
                        isSelected
                          ? 'border-primary text-foreground shadow-sm'
                          : 'border-border text-foreground hover:border-primary/40',
                        unavailable && 'cursor-not-allowed opacity-45 hover:border-border',
                      )}
                    >
                      <span
                        className={cn(
                          'relative grid size-7 place-items-center rounded-full border border-black/10',
                          isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-surface',
                        )}
                        style={{ backgroundColor: option.swatch }}
                        aria-hidden="true"
                      >
                        {isSelected ? <Check className="size-3.5 text-white mix-blend-difference" /> : null}
                      </span>
                      {option.label}
                    </button>
                  );
                }

                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`${option.label}${unavailable ? ', unavailable' : ''}`}
                    disabled={unavailable || disabled}
                    onClick={() => onChange(group.id, option.id)}
                    className={cn(
                      'inline-flex h-11 min-w-14 items-center justify-center rounded-xl border px-3.5 text-sm font-medium whitespace-nowrap transition-colors duration-fast focus-ring',
                      isSelected
                        ? 'border-primary bg-primary-tint text-primary'
                        : 'border-border bg-surface text-foreground hover:border-primary/40',
                      unavailable &&
                        'cursor-not-allowed opacity-45 line-through hover:border-border hover:bg-surface',
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
