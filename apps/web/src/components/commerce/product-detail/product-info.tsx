'use client';

import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Label } from '@novacommerce/ui/components/label';
import { PriceDisplay } from '@/components/commerce/price-display';
import { ProductRating } from '@/components/commerce/product-rating';
import { QuantitySelector } from '@/components/commerce/quantity-selector';
import { VariantSelector } from '@/components/commerce/variant-selector';
import { ProductHighlightSpecs } from '@/components/commerce/product-detail/product-highlight-specs';
import { brandHref } from '@/lib/view-models/product';
import type { ProductDetailViewModel } from '@/lib/view-models/product-detail';

export interface ProductInfoProps {
  detail: ProductDetailViewModel;
  selected: Record<string, string>;
  quantity: number;
  adding?: boolean;
  onVariantChange: (groupId: string, optionId: string) => void;
  onQuantityChange: (value: number) => void;
  onAddToCart: () => void;
  onWishlist: () => void;
  onNotify: () => void;
}

export function ProductInfo({
  detail,
  selected,
  quantity,
  adding = false,
  onVariantChange,
  onQuantityChange,
  onAddToCart,
  onWishlist,
  onNotify,
}: ProductInfoProps) {
  const { product, seller } = detail;
  const inStock = detail.availability === 'in_stock';

  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-2.5">
        <Link
          href={brandHref(product.brand)}
          className="text-sm font-semibold text-primary hover:text-primary-strong focus-ring"
        >
          {product.brand}
        </Link>
        <h1 className="text-[1.75rem] leading-tight font-bold tracking-tight text-ink md:text-[2rem]">
          {product.name}
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <ProductRating
            rating={product.rating}
            reviewCount={product.reviewCount}
            href="#reviews"
            countFormat="exact"
          />
          <span className="hidden text-border sm:inline" aria-hidden="true">
            |
          </span>
          <p className="text-muted-foreground">
            Sold by{' '}
            <Link href={seller.href} className="font-medium text-foreground hover:text-primary focus-ring">
              {seller.name}
            </Link>
          </p>
        </div>
      </div>

      <PriceDisplay
        price={product.price}
        compareAtPrice={product.compareAtPrice}
        currency={product.currency}
        discountPercent={product.discountPercent}
        size="lg"
        showDiscountBadge
      />

      <p className="max-w-[42rem] text-body-sm leading-relaxed text-copy">{detail.shortDescription}</p>

      <ProductHighlightSpecs specs={detail.highlightSpecs} />

      <VariantSelector groups={detail.variants} selected={selected} onChange={onVariantChange} />

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
            className="h-12 rounded-2xl"
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

      <div className="flex items-center gap-2.5">
        {inStock ? (
          <Button
            className="h-12 min-h-12 flex-1 rounded-2xl"
            size="lg"
            variant="primary-gradient"
            loading={adding}
            onClick={onAddToCart}
          >
            <ShoppingCart className="size-4" aria-hidden="true" />
            Add to Cart
          </Button>
        ) : (
          <Button className="h-12 min-h-12 flex-1 rounded-2xl" size="lg" variant="secondary" onClick={onNotify}>
            Notify Me
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-12 min-h-12 min-w-12 rounded-2xl"
          aria-label={`Save ${product.name} to wishlist`}
          onClick={onWishlist}
        >
          <Heart className="size-4" />
        </Button>
      </div>
    </div>
  );
}
