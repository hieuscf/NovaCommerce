'use client';

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
import { toast } from '@novacommerce/ui/components/toast';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

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

function galleryBadge(detail: ProductDetailViewModel): string | undefined {
  const badge = detail.product.badge;
  if (badge === 'bestseller') return 'Best Seller';
  if (badge === 'new') return 'New';
  if (badge === 'sale') {
    return detail.product.discountPercent ? `-${detail.product.discountPercent}%` : 'Sale';
  }
  return undefined;
}

export function ProductOverview({ detail }: { detail: ProductDetailViewModel }) {
  const router = useRouter();
  const [selected, setSelected] = useState(() =>
    defaultVariantSelection(detail.variants, detail.product.variant),
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImageId, setActiveImageId] = useState(() => initialImageId(detail));
  const [adding, setAdding] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  function saveWishlist() {
    toast.success('Added to wishlist', { description: detail.product.name });
  }

  function notifyMe() {
    toast.success('We will notify you', {
      description: `${detail.product.name} when it is back in stock.`,
    });
  }

  return (
    <>
      <ProductGallery
        images={detail.images}
        activeId={activeImageId}
        onActiveChange={setActiveImageId}
        productName={detail.product.name}
        badge={galleryBadge(detail)}
      />
      <ProductInfo
        detail={detail}
        selected={selected}
        quantity={quantity}
        adding={adding}
        onVariantChange={handleVariantChange}
        onQuantityChange={setQuantity}
        onAddToCart={() => void addToCart()}
        onWishlist={saveWishlist}
        onNotify={notifyMe}
      />
      {mounted
        ? createPortal(
            <StickyPurchaseBar
              productName={detail.product.name}
              priceLabel={formatPrice(detail.product.price, detail.product.currency)}
              inStock={inStock}
              onAddToCart={() => void addToCart()}
              onWishlist={saveWishlist}
              onNotify={notifyMe}
            />,
            document.body,
          )
        : null}
    </>
  );
}
