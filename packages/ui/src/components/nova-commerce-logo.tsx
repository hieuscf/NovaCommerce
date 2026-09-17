import * as React from 'react';
import { cn } from '../lib/utils';

export interface NovaCommerceLogoProps {
  className?: string;
  /** Classes applied to the wordmark (e.g. hide on small screens). */
  wordmarkClassName?: string;
  showText?: boolean;
  iconOnly?: boolean;
  /** Mark edge length in pixels. */
  size?: number;
  /** `inverse` is for dark promotional surfaces and the storefront topbar. */
  tone?: 'default' | 'inverse';
  /** Optional tagline under the wordmark (footer). */
  subLabel?: string;
}

const MARK_BACKGROUND = 'linear-gradient(140deg, #60a5fa 0%, #6366f1 45%, #a855f7 100%)';
const MARK_SHADOW = '0 4px 12px rgba(79, 70, 229, 0.35)';

export function NovaCommerceLogo({
  className,
  wordmarkClassName,
  showText = true,
  iconOnly = false,
  size = 32,
  tone = 'default',
  subLabel,
}: NovaCommerceLogoProps) {
  const withWordmark = showText && !iconOnly;

  return (
    <span
      className={cn('inline-flex items-center gap-2', className)}
      aria-label={withWordmark ? undefined : 'NovaCommerce logo'}
    >
      <span
        className="shrink-0 rounded-[9px] font-bold text-white"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          background: MARK_BACKGROUND,
          boxShadow: MARK_SHADOW,
          fontSize: Math.round(size * 0.55),
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}
        aria-hidden="true"
      >
        N
      </span>
      {withWordmark ? (
        <span className="flex min-w-0 flex-col justify-center leading-tight">
          <span
            className={cn(
              'text-[17px] font-bold tracking-tight',
              tone === 'inverse' ? 'text-white' : 'text-foreground',
              wordmarkClassName,
            )}
          >
            NovaCommerce
          </span>
          {subLabel ? (
            <span
              className={cn(
                'text-[11px] font-medium',
                tone === 'inverse' ? 'text-white/60' : 'text-slate-500',
              )}
            >
              {subLabel}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
