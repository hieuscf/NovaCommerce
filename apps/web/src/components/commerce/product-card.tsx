'use client';

import Image from 'next/image';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { toast } from '@novacommerce/ui/components/toast';
import { Badge } from '@novacommerce/ui/components/badge';
import { Button } from '@novacommerce/ui/components/button';
import { Card } from '@novacommerce/ui/components/card';
import { Skeleton, SkeletonText } from '@novacommerce/ui/components/skeleton';
import {
  formatPrice,
  formatReviewCount,
  type ProductViewModel,
} from '@/lib/view-models/product';
import { ProductShape, type ProductShapeName } from '@/components/commerce/product-shape';
import { cn } from '@/lib/utils';

export interface ProductCardProps {
  product: ProductViewModel;
  variant?: 'default' | 'compact' | 'featured';
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

function badgeLabel(product: ProductViewModel): string | undefined {
  if (product.badge === 'bestseller') return '★ Best Seller';
  if (product.badge === 'sale' && product.discountPercent) {
    return `-${product.discountPercent}%`;
  }
  if (product.badge === 'new') return 'New';
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
  const label = badgeLabel(product);
  const compact = variant === 'compact';
  const useIllustration = compact && illustration;

  return (
    <Card
      className={cn(
        'group overflow-hidden border-border/80 bg-surface p-0 hover:-translate-y-0.5 hover:shadow-md',
        compact && 'rounded-[18px] shadow-card-soft hover:shadow-md',
        className,
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden',
          useIllustration ? 'nova-shot h-[112px]' : compact ? 'h-[112px] bg-surface-subtle' : 'aspect-square bg-surface-subtle',
        )}
      >
        {label ? (
          <Badge
            variant={badgeVariant(product.badge)}
            className={cn(
              'absolute top-3 left-3 z-10',
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
            className="absolute top-3 right-3 z-10 bg-surface/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
            aria-label={`Save ${product.name}`}
            onClick={() => toast.success('Added to wishlist')}
          >
            <Heart className="size-4" />
          </Button>
        ) : null}
        {useIllustration ? (
          <>
            <ProductShape shape={illustration} />
            <span className="nova-shot-glow absolute inset-x-0 -bottom-[40%] h-[70%]" />
          </>
        ) : (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        )}
      </div>

      <div className={cn('space-y-3 p-4', compact && 'space-y-2 p-3.5')}>
        {showRating ? (
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
              compact ? 'text-[13px] leading-5' : 'text-foreground',
            )}
          >
            {product.name}
          </h3>
          <p className={cn('mt-1 truncate text-muted-foreground', compact ? 'text-[11px]' : 'text-sm')}>
            {product.brand}
            {product.variant ? ` · ${product.variant}` : ''}
          </p>
        </div>

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

        <div className="flex items-center gap-2">
          <Button
            className={cn('min-w-0 flex-1', compact && 'h-9 rounded-pill text-xs shadow-cta')}
            size={compact ? 'sm' : 'default'}
            variant="primary-gradient"
            onClick={() => toast.success('Added to cart', { description: product.name })}
          >
            {compact ? null : <ShoppingCart className="size-4" />}
            Add to Cart
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

export function ProductCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <Card className="overflow-hidden p-0">
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
