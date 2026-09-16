import { formatPrice } from '@/lib/view-models/product';
import { cn } from '@/lib/utils';

export interface PriceDisplayProps {
  price: number;
  compareAtPrice?: number;
  currency?: string;
  discountPercent?: number;
  size?: 'sm' | 'md' | 'lg';
  showDiscountBadge?: boolean;
  className?: string;
}

const priceSize = {
  sm: 'text-sm font-extrabold',
  md: 'text-lg font-extrabold',
  lg: 'text-[2rem] leading-none font-extrabold tracking-tight md:text-[2.25rem]',
};

const compareSize = {
  sm: 'text-[11px]',
  md: 'text-sm',
  lg: 'text-base',
};

export function PriceDisplay({
  price,
  compareAtPrice,
  currency = 'USD',
  discountPercent,
  size = 'md',
  showDiscountBadge = false,
  className,
}: PriceDisplayProps) {
  const hasCompare = compareAtPrice != null && compareAtPrice > price;
  const percent =
    discountPercent ??
    (hasCompare && compareAtPrice
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : undefined);

  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-3 gap-y-1', className)}>
      <span className={cn('text-ink', priceSize[size])}>{formatPrice(price, currency)}</span>
      {hasCompare ? (
        <span className={cn('text-muted-foreground line-through', compareSize[size])}>
          {formatPrice(compareAtPrice, currency)}
        </span>
      ) : null}
      {showDiscountBadge && percent && percent > 0 ? (
        <span className="rounded-pill bg-destructive/10 px-2 py-0.5 text-caption font-semibold text-destructive">
          -{percent}%
        </span>
      ) : null}
    </div>
  );
}
