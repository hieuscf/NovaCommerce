import { catalogProducts } from '@/lib/mock-data/catalog';
import { cartFixtureLines, cartRecommendationIds, type CartFixtureLine } from '@/lib/mock-data/cart';
import {
  summarizeCart,
  type CartLineViewModel,
  type CartPageViewModel,
} from '@/lib/view-models/cart';
import type { ProductViewModel } from '@/lib/view-models/product';

const CART_CRUMBS = [
  { href: '/', label: 'Home' },
  { href: '/cart', label: 'Cart', current: true },
] as const;

function toLine(fixture: CartFixtureLine, product: ProductViewModel): CartLineViewModel {
  return {
    id: fixture.id,
    productId: product.id,
    slug: product.slug,
    name: product.name,
    imageUrl: product.imageUrl,
    variantLabel: fixture.variantLabel,
    unitPrice: product.price,
    quantity: fixture.quantity,
    currency: product.currency,
    inStock: product.inStock !== false,
    selected: fixture.selected !== false,
  };
}

/**
 * Presentation lookup for the cart page. Replace with a Cart Gateway adapter later.
 * Unknown fixture product ids are skipped. Unexpected failures must throw so
 * `cart/error.tsx` can render `ErrorState`. Empty lines are a valid empty cart.
 */
export function getCartPage(
  fixtures: readonly CartFixtureLine[] = cartFixtureLines,
): CartPageViewModel {
  const productsById = new Map(catalogProducts.map((product) => [product.id, product]));
  const lines = fixtures.flatMap((fixture) => {
    const product = productsById.get(fixture.productId);
    return product ? [toLine(fixture, product)] : [];
  });

  const recommendations = cartRecommendationIds.flatMap((id) => {
    const product = productsById.get(id);
    return product ? [product] : [];
  });

  return {
    crumbs: CART_CRUMBS,
    lines,
    summary: summarizeCart(lines),
    recommendations,
  };
}

export function getCartLineCount(
  fixtures: readonly CartFixtureLine[] = cartFixtureLines,
): number {
  return getCartPage(fixtures).summary.itemCount;
}
