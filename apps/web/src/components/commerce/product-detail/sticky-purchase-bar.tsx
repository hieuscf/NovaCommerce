'use client';

import { Heart } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { cn } from '@/lib/utils';

export interface StickyPurchaseBarProps {
  productName: string;
  priceLabel: string;
  inStock: boolean;
  onAddToCart: () => void;
  onWishlist: () => void;
  onNotify?: () => void;
  className?: string;
}

export function StickyPurchaseBar({
  productName,
  priceLabel,
  inStock,
  onAddToCart,
  onWishlist,
  onNotify,
  className,
}: StickyPurchaseBarProps) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-4 pt-3 shadow-lg backdrop-blur-md lg:hidden',
        'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
        className,
      )}
    >
      <div className="mx-auto flex max-w-lg items-center gap-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">{productName}</p>
          <p className="text-sm font-bold text-ink">{priceLabel}</p>
        </div>
        {inStock ? (
          <Button className="min-h-11 flex-1" variant="primary-gradient" onClick={onAddToCart}>
            Add to Cart
          </Button>
        ) : (
          <Button className="min-h-11 flex-1" variant="secondary" onClick={onNotify}>
            Notify Me
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Save ${productName} to wishlist`}
          onClick={onWishlist}
        >
          <Heart className="size-4" />
        </Button>
      </div>
    </div>
  );
}
