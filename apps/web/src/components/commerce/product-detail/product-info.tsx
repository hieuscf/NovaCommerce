'use client';

import Link from 'next/link';
import { Check, Heart } from 'lucide-react';
import { Badge } from '@novacommerce/ui/components/badge';
import { Button } from '@novacommerce/ui/components/button';
import { Label } from '@novacommerce/ui/components/label';
import { PriceDisplay } from '@/components/commerce/price-display';
import { ProductRating } from '@/components/commerce/product-rating';
import { QuantitySelector } from '@/components/commerce/quantity-selector';
import { VariantSelector } from '@/components/commerce/variant-selector';
import { TrustIndicators } from '@/components/commerce/product-detail/trust-indicators';
import { brandHref, formatPrice } from '@/lib/view-models/product';
import type { ProductDetailViewModel } from '@/lib/view-models/product-detail';
import { cn } from '@/lib/utils';

export interface ProductInfoProps {
  detail: ProductDetailViewModel;
  selected: Record<string, string>;
  quantity: number;
  onVariantChange: (groupId: string, optionId: string) => void;
  onQuantityChange: (value: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onWishlist: () => void;
  onNotify: () => void;
}

export function ProductInfo({
  detail,
  selected,
  quantity,
  onVariantChange,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
  onWishlist,
  onNotify,
}: ProductInfoProps) {
  const { product } = detail;
  const inStock = detail.availability === 'in_stock';

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={brandHref(product.brand)}
            className="text-caption font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground focus-ring"
          >
            {product.brand}
          </Link>
          {product.badge ? (
            <Badge variant={product.badge === 'sale' ? 'sale' : product.badge === 'new' ? 'info' : 'bestseller'}>
              {product.badge === 'sale' ? 'Sale' : product.badge === 'new' ? 'New' : 'Best seller'}
            </Badge>
          ) : null}
        </div>
        <h1 className="text-h2 text-balance text-ink">{product.name}</h1>
        <ProductRating
          rating={product.rating}
          reviewCount={product.reviewCount}
          href="#reviews"
          showScale
        />
      </div>

      <div className="space-y-2">
        <PriceDisplay
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          currency={product.currency}
          discountPercent={product.discountPercent}
          size="lg"
          showDiscountBadge
        />
        {product.badge === 'sale' && product.compareAtPrice ? (
          <p className="text-caption text-muted-foreground">
            You save {formatPrice(product.compareAtPrice - product.price, product.currency)}
          </p>
        ) : null}
      </div>

      <p className="max-w-[42rem] text-body-sm leading-relaxed text-copy">{detail.shortDescription}</p>

      <VariantSelector groups={detail.variants} selected={selected} onChange={onVariantChange} />

      <p
        className={cn(
          'inline-flex items-center gap-1.5 text-sm font-medium',
          inStock ? 'text-success-strong' : 'text-destructive-strong',
        )}
      >
        {inStock ? (
          <>
            <Check className="size-4" aria-hidden="true" />
            In Stock
          </>
        ) : (
          'Out of Stock'
        )}
      </p>

      {inStock ? (
        <div className="space-y-3">
          <Label htmlFor="pdp-quantity" id="pdp-quantity-label">
            Quantity
          </Label>
          <QuantitySelector
            id="pdp-quantity"
            labelledBy="pdp-quantity-label"
            value={quantity}
            onChange={onQuantityChange}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface-subtle px-4 py-4">
          <p className="text-sm font-semibold text-foreground">Out of Stock</p>
          <p className="mt-1 text-body-sm text-muted-foreground">
            This product is currently unavailable. Leave a notice and we will let you know when it returns.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {inStock ? (
          <div className="flex gap-2.5">
            <Button
              className="h-12 min-h-12 flex-1"
              size="lg"
              variant="primary-gradient"
              onClick={onAddToCart}
            >
              Add to Cart
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-12 min-h-12 min-w-12"
              aria-label={`Save ${product.name} to wishlist`}
              onClick={onWishlist}
            >
              <Heart className="size-4" />
            </Button>
          </div>
        ) : (
          <Button className="h-12 min-h-12 w-full" size="lg" variant="secondary" onClick={onNotify}>
            Notify Me
          </Button>
        )}
        {inStock ? (
          <Button className="h-12 min-h-12 w-full" size="lg" variant="outline" onClick={onBuyNow}>
            Buy Now
          </Button>
        ) : (
          <Button className="h-12 min-h-12 w-full" size="lg" variant="outline" disabled>
            Buy Now
          </Button>
        )}
      </div>

      <TrustIndicators items={detail.trustItems} />
    </div>
  );
}
