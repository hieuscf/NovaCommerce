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
        className="relative grid shrink-0 place-items-center rounded-[9px] font-bold text-white"
        style={{
          width: size,
          height: size,
          background: MARK_BACKGROUND,
          boxShadow: MARK_SHADOW,
          fontSize: size * 0.6,
          lineHeight: 1,
        }}
        aria-hidden="true"
      >
        N
      </span>
      {withWordmark ? (
        <span className="leading-tight">
          <span
            className={cn(
              'block text-[17px] font-bold tracking-tight',
              tone === 'inverse' ? 'text-white' : 'text-foreground',
              wordmarkClassName,
            )}
          >
            NovaCommerce
          </span>
          {subLabel ? <span className="block text-[11px] text-slate-500">{subLabel}</span> : null}
        </span>
      ) : null}
    </span>
  );
}
