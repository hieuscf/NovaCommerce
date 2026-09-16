'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@novacommerce/ui/components/toast';
import { ProductGallery } from '@/components/commerce/product-detail/product-gallery';
import { ProductInfo } from '@/components/commerce/product-detail/product-info';
import { StickyPurchaseBar } from '@/components/commerce/product-detail/sticky-purchase-bar';
import { addProductToCart } from '@/lib/cart/add-product-to-cart';
import { buildLoginHref } from '@/lib/auth/return-url';
import { formatPrice } from '@/lib/view-models/product';
import {
  defaultVariantSelection,
  type ProductDetailViewModel,
} from '@/lib/view-models/product-detail';

function initialImageId(detail: ProductDetailViewModel): string {
  const selected = defaultVariantSelection(detail.variants, detail.product.variant);
  for (const group of detail.variants) {
    const option = group.options.find((item) => item.id === selected[group.id]);
    if (option?.imageId) {
      return option.imageId;
    }
  }
  return detail.images[0]?.id ?? '';
}

export function ProductOverview({ detail }: { detail: ProductDetailViewModel }) {
  const router = useRouter();
  const [selected, setSelected] = useState(() =>
    defaultVariantSelection(detail.variants, detail.product.variant),
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImageId, setActiveImageId] = useState(() => initialImageId(detail));
  const [adding, setAdding] = useState(false);

  const inStock = detail.availability === 'in_stock';

  function handleVariantChange(groupId: string, optionId: string) {
    setSelected((current) => ({ ...current, [groupId]: optionId }));
    const group = detail.variants.find((item) => item.id === groupId);
    const option = group?.options.find((item) => item.id === optionId);
    if (option?.imageId) {
      setActiveImageId(option.imageId);
    }
  }

  async function addToCart() {
    if (adding) {
      return;
    }

    setAdding(true);
    try {
      const result = await addProductToCart({
        productId: detail.product.id,
        unitPriceAmount: detail.product.price,
        unitPriceCurrency: detail.product.currency,
        quantity,
      });

      if (result.status === 'login_required') {
        const returnUrl =
          typeof window !== 'undefined'
            ? `${window.location.pathname}${window.location.search}`
            : `/products/${detail.product.slug}`;
        router.push(buildLoginHref(returnUrl, 'session-required'));
        return;
      }

      if (result.status === 'unsupported_product') {
        toast.error('Could not add to cart', {
          description: 'Open this product from Shop to use the live catalog cart.',
        });
        return;
      }

      if (result.status === 'error') {
        toast.error('Could not add to cart', { description: result.message });
        return;
      }

      toast.success('Added to cart', {
        description: `${detail.product.name} × ${quantity}`,
      });
    } finally {
      setAdding(false);
    }
  }

  function buyNow() {
    toast.success('Checkout is coming next', { description: detail.product.name });
  }

  function saveWishlist() {
    toast.success('Added to wishlist', { description: detail.product.name });
  }

  function notifyMe() {
    toast.success('We will notify you', {
      description: `${detail.product.name} when it is back in stock.`,
    });
  }

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.22fr)_minmax(0,1fr)] lg:gap-14 xl:gap-16">
      <ProductGallery
        images={detail.images}
        activeId={activeImageId}
        onActiveChange={setActiveImageId}
        productName={detail.product.name}
      />
      <div className="lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1">
        <ProductInfo
          detail={detail}
          selected={selected}
          quantity={quantity}
          onVariantChange={handleVariantChange}
          onQuantityChange={setQuantity}
          onAddToCart={() => void addToCart()}
          onBuyNow={buyNow}
          onWishlist={saveWishlist}
          onNotify={notifyMe}
        />
      </div>
      <StickyPurchaseBar
        productName={detail.product.name}
        priceLabel={formatPrice(detail.product.price, detail.product.currency)}
        inStock={inStock}
        onAddToCart={() => void addToCart()}
        onWishlist={saveWishlist}
        onNotify={notifyMe}
      />
    </div>
  );
}
