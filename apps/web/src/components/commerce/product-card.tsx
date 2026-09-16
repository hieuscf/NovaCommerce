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
  variant?: 'default' | 'compact' | 'featured' | 'listing' | 'row';
  showWishlist?: boolean;
  showRating?: boolean;
  illustration?: ProductShapeName;
  className?: string;
}

function listingBadgeClass(badge: ProductViewModel['badge']) {
  if (badge === 'bestseller') {
    return 'border-transparent bg-amber-500 text-white';
  }
  if (badge === 'sale') {
    return 'border-transparent bg-destructive text-white';
  }
  if (badge === 'new') {
    return 'border-transparent bg-emerald-500 text-white';
  }
  return undefined;
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

function badgeLabel(product: ProductViewModel, shop: boolean): string | undefined {
  if (product.badge === 'bestseller') return shop ? 'Best Seller' : '★ Best Seller';
  if (product.badge === 'sale') {
    if (product.discountPercent) return `-${product.discountPercent}%`;
    return shop ? 'Sale' : 'Sale';
  }
  if (product.badge === 'new') return 'New';
  return undefined;
}

function ShopBadge({ product, shop }: { product: ProductViewModel; shop: boolean }) {
  const label = badgeLabel(product, shop);
  if (!label) {
    return null;
  }

  return (
    <Badge
      variant={badgeVariant(product.badge)}
      className={cn(
        'pointer-events-none absolute top-3 left-3 z-10',
        shop && listingBadgeClass(product.badge),
        product.badge === 'bestseller' && !shop && 'border-amber-200 bg-white text-amber-600',
      )}
    >
      {label}
    </Badge>
  );
}

function WishlistButton({
  product,
  className,
}: {
  product: ProductViewModel;
  className?: string;
}) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={cn(
        'absolute top-3 right-3 z-10 rounded-full bg-surface/95 shadow-sm hover:bg-surface',
        className,
      )}
      aria-label={`Save ${product.name}`}
      onClick={() => toast.success('Added to wishlist')}
    >
      <Heart className="size-4" />
    </Button>
  );
}

function ShopRating({ product }: { product: ProductViewModel }) {
  return (
    <p className="flex items-center gap-1.5 text-sm">
      <Star className="size-3.5 fill-current text-warning" aria-hidden="true" />
      <span className="text-xs font-semibold text-foreground">{product.rating.toFixed(1)}</span>
      <span className="text-xs text-muted-foreground">
        ({formatReviewCount(product.reviewCount)} reviews)
      </span>
    </p>
  );
}

function ShopPrice({ product, large = false }: { product: ProductViewModel; large?: boolean }) {
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className={cn('font-bold text-primary', large ? 'text-lg' : 'text-base')}>
        {formatPrice(product.price, product.currency)}
      </span>
      {product.compareAtPrice ? (
        <span className="text-xs text-muted-foreground line-through">
          {formatPrice(product.compareAtPrice, product.currency)}
        </span>
      ) : null}
      {product.discountPercent ? (
        <span className="text-xs font-semibold text-destructive">-{product.discountPercent}%</span>
      ) : null}
    </div>
  );
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
  const row = variant === 'row';
  const compact = variant === 'compact';
  const useIllustration = compact && illustration;
  const available = product.inStock !== false;
  const href = productHref(product.slug);
  const specs = [product.brand, product.variant].filter(Boolean).join(' · ');

  if (row) {
    return (
      <Card
        className={cn(
          'group flex h-full overflow-hidden border-border/80 bg-surface p-0 shadow-card-soft',
          className,
        )}
      >
        <div className="relative w-[148px] shrink-0 bg-surface-subtle sm:w-[196px]">
          <ShopBadge product={product} shop />
          <Link href={href} className="absolute inset-0" aria-label={product.name}>
            <Image src={product.imageUrl} alt="" fill sizes="196px" className="object-contain p-4" />
          </Link>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
          <div className="min-w-0 flex-1 space-y-1.5">
            <h3 className="truncate text-base font-semibold text-ink">
              <Link href={href} className="hover:text-primary focus-ring">
                {product.name}
              </Link>
            </h3>
            <p className="truncate text-sm text-muted-foreground">{specs}</p>
            {showRating ? <ShopRating product={product} /> : null}
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:w-48">
            <ShopPrice product={product} large />
            <Button
              className="w-full rounded-xl"
              variant="primary-gradient"
              disabled={!available}
              onClick={() => toast.success('Added to cart', { description: product.name })}
            >
              <ShoppingCart className="size-4" aria-hidden="true" />
              {available ? 'Add to Cart' : 'Out of stock'}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'group overflow-hidden border-border/80 bg-surface p-0 transition-shadow duration-normal hover:shadow-md',
        !listing && 'hover:-translate-y-0.5',
        compact && 'rounded-[18px] shadow-card-soft hover:shadow-md',
        listing && 'flex h-full flex-col rounded-[1.5rem] shadow-card-soft hover:shadow-md',
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
              : listing
                ? 'aspect-square bg-surface-subtle'
                : 'aspect-square bg-surface-subtle',
        )}
      >
        <ShopBadge product={product} shop={listing} />
        {showWishlist && !compact ? (
          <WishlistButton
            product={product}
            className={listing ? undefined : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'}
          />
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
              className={cn(
                'transition-transform duration-300 group-hover:scale-[1.03]',
                listing ? 'object-contain p-5' : 'object-cover',
              )}
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
              compact
                ? 'text-[13px] leading-5'
                : listing
                  ? 'min-h-10 text-sm leading-5 text-foreground'
                  : 'text-foreground',
            )}
          >
            <Link href={href} className="rounded-sm transition-colors duration-fast hover:text-primary focus-ring">
              {product.name}
            </Link>
          </h3>
          <p className={cn('mt-1 truncate text-muted-foreground', compact || listing ? 'text-[11px]' : 'text-sm')}>
            {specs}
          </p>
        </div>

        {showRating && listing ? <ShopRating product={product} /> : null}

        {listing ? (
          <ShopPrice product={product} />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className={cn('font-extrabold text-ink', compact ? 'text-sm' : 'text-lg')}>
              {formatPrice(product.price, product.currency)}
            </span>
            {product.compareAtPrice ? (
              <span className="text-[11px] text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice, product.currency)}
              </span>
            ) : null}
          </div>
        )}

        <div className={cn('flex items-center gap-2', listing && 'mt-auto pt-1')}>
          <Button
            className={cn('min-w-0 flex-1', compact && 'h-9 rounded-pill text-xs shadow-cta', listing && 'rounded-xl')}
            size={compact || listing ? 'sm' : 'default'}
            variant="primary-gradient"
            disabled={!available}
            onClick={() => toast.success('Added to cart', { description: product.name })}
          >
            {compact ? null : <ShoppingCart className="size-4" aria-hidden="true" />}
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
    <Card className={cn('overflow-hidden p-0', listing && 'h-full rounded-[1.5rem]')}>
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
