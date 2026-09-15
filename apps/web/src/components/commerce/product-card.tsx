'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { toast } from '@novacommerce/ui/components/toast';
import { Badge } from '@novacommerce/ui/components/badge';
import { Button } from '@novacommerce/ui/components/button';
import { Card } from '@novacommerce/ui/components/card';
import { Skeleton, SkeletonText } from '@novacommerce/ui/components/skeleton';
import {
  formatPrice,
  formatReviewCount,
  productHref,
  type ProductViewModel,
} from '@/lib/view-models/product';
import { ProductShape, type ProductShapeName } from '@/components/commerce/product-shape';
import { cn } from '@/lib/utils';

export interface ProductCardProps {
  product: ProductViewModel;
  variant?: 'default' | 'compact' | 'featured' | 'listing';
  showWishlist?: boolean;
  showRating?: boolean;
  illustration?: ProductShapeName;
  className?: string;
}

function badgeVariant(badge: ProductViewModel['badge']) {
  switch (badge) {
    case 'bestseller':
      return 'bestseller' as const;
    case 'sale':
      return 'sale' as const;
    case 'new':
      return 'info' as const;
    default:
      return 'default' as const;
  }
}

function badgeLabel(product: ProductViewModel, listing: boolean): string | undefined {
  if (product.badge === 'bestseller') return listing ? 'BEST SELLER' : '★ Best Seller';
  if (product.badge === 'sale') {
    if (listing) return 'SALE';
    if (product.discountPercent) return `-${product.discountPercent}%`;
    return 'Sale';
  }
  if (product.badge === 'new') return listing ? 'NEW' : 'New';
  return undefined;
}

export function ProductCard({
  product,
  variant = 'default',
  showWishlist = true,
  showRating = true,
  illustration,
  className,
}: ProductCardProps) {
  const listing = variant === 'listing';
  const label = badgeLabel(product, listing);
  const compact = variant === 'compact';
  const useIllustration = compact && illustration;
  const available = product.inStock !== false;
  const href = productHref(product.slug);

  return (
    <Card
      className={cn(
        'group overflow-hidden border-border/80 bg-surface p-0 transition-shadow duration-normal hover:shadow-md',
        !listing && 'hover:-translate-y-0.5',
        compact && 'rounded-[18px] shadow-card-soft hover:shadow-md',
        listing && 'flex h-full flex-col',
        className,
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden',
          useIllustration
            ? 'nova-shot h-[112px]'
            : compact
              ? 'h-[112px] bg-surface-subtle'
              : 'aspect-square bg-surface-subtle',
        )}
      >
        {label ? (
          <Badge
            variant={badgeVariant(product.badge)}
            className={cn(
              'pointer-events-none absolute top-3 left-3 z-10',
              product.badge === 'bestseller' && compact && 'border-amber-200 bg-white text-amber-600',
            )}
          >
            {label}
          </Badge>
        ) : null}
        {showWishlist && !compact ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn(
              'absolute top-3 right-3 z-10 bg-surface/90 backdrop-blur-sm transition-opacity duration-fast hover:bg-surface',
              listing
                ? 'opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100'
                : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
            )}
            aria-label={`Save ${product.name}`}
            onClick={() => toast.success('Added to wishlist')}
          >
            <Heart className="size-4" />
          </Button>
        ) : null}
        <Link href={href} className="absolute inset-0" aria-label={product.name}>
          {useIllustration && illustration ? (
            <>
              <ProductShape shape={illustration} />
              <span className="nova-shot-glow absolute inset-x-0 -bottom-[40%] h-[70%]" />
            </>
          ) : (
            <Image
              src={product.imageUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          )}
        </Link>
      </div>

      <div
        className={cn(
          listing ? 'flex flex-1 flex-col gap-2 p-4' : 'space-y-3 p-4',
          compact && 'space-y-2 p-3.5',
        )}
      >
        {listing ? (
          <p className="truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            {product.brand}
          </p>
        ) : null}

        {showRating && !listing ? (
          <div className="flex items-center gap-1.5 text-sm">
            <div className="flex items-center gap-0.5 text-warning">
              <Star className="size-3 fill-current" />
              <span className="text-[11px] font-semibold text-foreground">
                {product.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              ({formatReviewCount(product.reviewCount)})
            </span>
          </div>
        ) : null}

        <div>
          <h3
            className={cn(
              'line-clamp-2 font-semibold text-ink',
              compact ? 'text-[13px] leading-5' : listing ? 'min-h-10 text-sm leading-5 text-foreground' : 'text-foreground',
            )}
          >
            <Link href={href} className="rounded-sm transition-colors duration-fast hover:text-primary focus-ring">
              {product.name}
            </Link>
          </h3>
          {listing ? null : (
            <p className={cn('mt-1 truncate text-muted-foreground', compact ? 'text-[11px]' : 'text-sm')}>
              {product.brand}
              {product.variant ? ` · ${product.variant}` : ''}
            </p>
          )}
        </div>

        {showRating && listing ? (
          <div className="flex items-center gap-1.5 text-sm">
            <div className="flex items-center gap-0.5 text-warning">
              <Star className="size-3.5 fill-current" />
              <span className="text-xs font-semibold text-foreground">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-muted-foreground">({formatReviewCount(product.reviewCount)})</span>
          </div>
        ) : null}

        <div className="flex items-baseline gap-2">
          <span className={cn('font-extrabold text-ink', compact ? 'text-sm' : listing ? 'text-base' : 'text-lg')}>
            {formatPrice(product.price, product.currency)}
          </span>
          {product.compareAtPrice ? (
            <span className="text-[11px] text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice, product.currency)}
            </span>
          ) : null}
        </div>

        <div
          className={cn(
            'flex items-center gap-2',
            listing &&
              'mt-auto pt-1 opacity-100 transition-opacity duration-fast md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100',
          )}
        >
          <Button
            className={cn('min-w-0 flex-1', compact && 'h-9 rounded-pill text-xs shadow-cta')}
            size={compact || listing ? 'sm' : 'default'}
            variant="primary-gradient"
            disabled={!available}
            onClick={() => toast.success('Added to cart', { description: product.name })}
          >
            {compact || listing ? null : <ShoppingCart className="size-4" />}
            {available ? 'Add to Cart' : 'Out of stock'}
          </Button>
          {showWishlist && compact ? (
            <Button
              variant="outline"
              size="icon-sm"
              className="size-9 rounded-pill"
              aria-label={`Save ${product.name}`}
              onClick={() => toast.success('Added to wishlist')}
            >
              <Heart className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export function ProductCardSkeleton({
  compact = false,
  listing = false,
}: {
  compact?: boolean;
  listing?: boolean;
}) {
  return (
    <Card className={cn('overflow-hidden p-0', listing && 'h-full')}>
      <Skeleton className={cn('rounded-none', compact ? 'h-[112px]' : 'aspect-square')} />
      <div className="grid gap-3 p-4">
        <Skeleton variant="text" className="w-24" />
        <SkeletonText lines={2} />
        <Skeleton variant="text" className="h-6 w-20" />
        <Skeleton className="h-11 w-full" />
      </div>
    </Card>
  );
}
