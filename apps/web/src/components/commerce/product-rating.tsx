import Link from 'next/link';
import { Star } from 'lucide-react';
import { formatExactReviewCount, formatReviewCount } from '@/lib/view-models/product';
import { cn } from '@/lib/utils';

export interface ProductRatingProps {
  rating: number;
  reviewCount: number;
  href?: string;
  size?: 'sm' | 'md';
  showScale?: boolean;
  countFormat?: 'compact' | 'exact';
  className?: string;
}

function Stars({ rating, iconClass }: { rating: number; iconClass: string }) {
  const rounded = Math.round(rating);

  return (
    <span className="flex items-center gap-0.5 text-warning" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(iconClass, index < rounded ? 'fill-current' : 'fill-transparent opacity-40')}
        />
      ))}
    </span>
  );
}

export function ProductRating({
  rating,
  reviewCount,
  href,
  size = 'md',
  showScale = false,
  countFormat = 'compact',
  className,
}: ProductRatingProps) {
  const compact = size === 'sm';
  const countLabel =
    countFormat === 'exact' ? formatExactReviewCount(reviewCount) : formatReviewCount(reviewCount);
  const label = `${rating.toFixed(1)} out of 5, ${countLabel} reviews`;
  const content = (
    <>
      <Stars rating={rating} iconClass={compact ? 'size-3' : 'size-3.5'} />
      <span className={cn('font-semibold text-foreground', compact ? 'text-[11px]' : 'text-sm')}>
        {rating.toFixed(1)}
      </span>
      {showScale ? <span className="text-muted-foreground">/ 5</span> : null}
      <span className={cn('text-muted-foreground', compact ? 'text-[11px]' : 'text-sm')}>
        ({countLabel} reviews)
      </span>
    </>
  );

  const classes = cn(
    'inline-flex items-center gap-1.5',
    compact ? 'text-[11px]' : 'text-sm',
    href && 'rounded-md hover:text-foreground focus-ring',
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={`${label}. Jump to reviews`}>
        {content}
      </Link>
    );
  }

  return (
    <p className={classes} aria-label={label}>
      {content}
    </p>
  );
}
