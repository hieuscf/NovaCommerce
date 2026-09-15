'use client';

import { useMemo, useState } from 'react';
import { toast } from '@novacommerce/ui/components/toast';
import { Container } from '@novacommerce/ui/components/container';
import { ShopBreadcrumb } from '@/components/commerce/listing/shop-breadcrumb';
import { CartEmptyState } from '@/components/commerce/cart/cart-empty';
import { CartItemsPanel } from '@/components/commerce/cart/cart-items';
import { CartRecommendations } from '@/components/commerce/cart/cart-recommendations';
import { CartSummary } from '@/components/commerce/cart/cart-summary';
import { summarizeCart, type CartLineViewModel, type CartPageViewModel } from '@/lib/view-models/cart';
import type { ProductViewModel } from '@/lib/view-models/product';

export function CartPage({ cart }: { cart: CartPageViewModel }) {
  const [lines, setLines] = useState<CartLineViewModel[]>(() => [...cart.lines]);
  const summary = useMemo(() => summarizeCart(lines), [lines]);

  function updateLine(id: string, patch: Partial<CartLineViewModel>) {
    setLines((current) => current.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  }

  function handleQuantityChange(id: string, quantity: number) {
    updateLine(id, { quantity });
  }

  function handleSelect(id: string, selected: boolean) {
    updateLine(id, { selected });
  }

  function handleRemove(id: string) {
    const removed = lines.find((line) => line.id === id);
    setLines((current) => current.filter((line) => line.id !== id));
    if (removed) {
      toast.success('Removed from cart', { description: removed.name });
    }
  }

  function handleAddRecommendation(product: ProductViewModel) {
    setLines((current) => {
      const existing = current.find((line) => line.productId === product.id);
      if (existing) {
        return current.map((line) =>
          line.id === existing.id ? { ...line, quantity: line.quantity + 1, selected: true } : line,
        );
      }

      return [
        ...current,
        {
          id: `line-${product.id}`,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          imageUrl: product.imageUrl,
          variantLabel: product.variant ?? product.brand,
          unitPrice: product.price,
          quantity: 1,
          currency: product.currency,
          inStock: product.inStock !== false,
          selected: true,
        },
      ];
    });
    toast.success('Added to cart', { description: product.name });
  }

  function handleCheckoutSoon() {
    toast.success('Checkout is coming next', {
      description: 'Your cart is ready when checkout is available.',
    });
  }

  return (
    <div className="bg-page-canvas min-h-svh">
      <Container size="wide" className="py-8 lg:py-10">
        <h1 className="sr-only">Shopping Cart</h1>
        <ShopBreadcrumb crumbs={cart.crumbs} />

        {lines.length === 0 ? (
          <div className="mt-6">
            <CartEmptyState />
          </div>
        ) : (
          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
            <CartItemsPanel
              lines={lines}
              summary={summary}
              onSelect={handleSelect}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemove}
            />
            <CartSummary
              summary={summary}
              onCheckout={handleCheckoutSoon}
              onPayPal={handleCheckoutSoon}
            />
          </div>
        )}

        <CartRecommendations products={cart.recommendations} onAdd={handleAddRecommendation} />
      </Container>
    </div>
  );
}
