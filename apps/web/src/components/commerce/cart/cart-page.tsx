'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@novacommerce/ui/components/toast';
import { Container } from '@novacommerce/ui/components/container';
import { ShopBreadcrumb } from '@/components/commerce/listing/shop-breadcrumb';
import { CartEmptyState } from '@/components/commerce/cart/cart-empty';
import { CartItemsPanel } from '@/components/commerce/cart/cart-items';
import { CartRecommendations } from '@/components/commerce/cart/cart-recommendations';
import { CartSummary } from '@/components/commerce/cart/cart-summary';
import { cartClient } from '@/lib/cart/client';
import { mapCartDtoToPage } from '@/lib/cart/get-cart-page';
import { preserveLineSelection } from '@/lib/cart/mappers';
import { toFormError } from '@/lib/errors';
import { summarizeCart, type CartLineViewModel, type CartPageViewModel } from '@/lib/view-models/cart';
import type { ProductViewModel } from '@/lib/view-models/product';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isGatewayId(value: string): boolean {
  return UUID_RE.test(value);
}

export function CartPage({ cart }: { cart: CartPageViewModel }) {
  const router = useRouter();
  const [lines, setLines] = useState<CartLineViewModel[]>(() => [...cart.lines]);
  const [recommendations] = useState(() => [...cart.recommendations]);
  const summary = useMemo(() => summarizeCart(lines), [lines]);

  function updateLine(id: string, patch: Partial<CartLineViewModel>) {
    setLines((current) => current.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  }

  async function syncFromCartDto(
    previousSelection: readonly CartLineViewModel[],
    cartDto: Awaited<ReturnType<typeof cartClient.getCart>>,
  ) {
    const mapped = await mapCartDtoToPage(cartDto);
    setLines(preserveLineSelection(previousSelection, mapped.lines));
  }

  function handleQuantityChange(id: string, quantity: number) {
    const previous = lines;
    const optimistic = previous.map((line) => (line.id === id ? { ...line, quantity } : line));
    setLines(optimistic);

    if (!isGatewayId(id)) {
      return;
    }

    void (async () => {
      try {
        const cartDto = await cartClient.updateItemQuantity(id, { quantity });
        await syncFromCartDto(optimistic, cartDto);
      } catch (error) {
        setLines(previous);
        toast.error('Could not update quantity', { description: toFormError(error) });
      }
    })();
  }

  function handleSelect(id: string, selected: boolean) {
    updateLine(id, { selected });
  }

  function handleRemove(id: string) {
    const previous = lines;
    const removed = lines.find((line) => line.id === id);
    const optimistic = previous.filter((line) => line.id !== id);
    setLines(optimistic);
    if (removed) {
      toast.success('Removed from cart', { description: removed.name });
    }

    if (!isGatewayId(id)) {
      return;
    }

    void (async () => {
      try {
        const cartDto = await cartClient.removeItem(id);
        await syncFromCartDto(optimistic, cartDto);
      } catch (error) {
        setLines(previous);
        toast.error('Could not remove item', { description: toFormError(error) });
      }
    })();
  }

  function handleAddRecommendation(product: ProductViewModel) {
    const previous = lines;
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

    if (!isGatewayId(product.id)) {
      return;
    }

    void (async () => {
      try {
        const cartDto = await cartClient.addItem({
          productId: product.id,
          quantity: 1,
          unitPriceAmount: product.price,
          unitPriceCurrency: product.currency,
        });
        await syncFromCartDto(previous, cartDto);
      } catch (error) {
        setLines(previous);
        toast.error('Could not add item', { description: toFormError(error) });
      }
    })();
  }

  function handleCheckout() {
    router.push('/checkout');
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
              onCheckout={handleCheckout}
              onPayPal={handleCheckout}
            />
          </div>
        )}

        <CartRecommendations products={recommendations} onAdd={handleAddRecommendation} />
      </Container>
    </div>
  );
}
