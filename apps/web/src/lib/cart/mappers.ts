import { PRODUCT_IMAGE_FALLBACK } from '@/lib/catalog/mappers';
import type { ProductDto } from '@/lib/catalog/types';
import {
  summarizeCart,
  type CartLineViewModel,
  type CartPageViewModel,
} from '@/lib/view-models/cart';
import type { ProductViewModel } from '@/lib/view-models/product';
import type { CartDto, CartItemDto } from './types';

export const CART_CRUMBS = [
  { href: '/', label: 'Home' },
  { href: '/cart', label: 'Cart', current: true },
] as const;

function variantLabelFromProduct(product: ProductDto | undefined, variantId?: string): string {
  if (!product) {
    return '';
  }

  if (variantId) {
    const variant = product.variants.find((item) => item.id === variantId);
    if (variant) {
      const values = Object.values(variant.attributes).filter(Boolean);
      if (values.length > 0) {
        return values.join(' · ');
      }
    }
  }

  const first = product.variants[0];
  if (first) {
    const values = Object.values(first.attributes).filter(Boolean);
    if (values.length > 0) {
      return values.join(' · ');
    }
  }

  return '';
}

export function mapCartItemToLine(
  item: CartItemDto,
  product: ProductDto | undefined,
  productView?: ProductViewModel,
): CartLineViewModel {
  return {
    id: item.id,
    productId: item.productId,
    slug: productView?.slug ?? product?.slug ?? item.productId,
    name: productView?.name ?? product?.name ?? 'Product',
    imageUrl: productView?.imageUrl ?? product?.images[0]?.url ?? PRODUCT_IMAGE_FALLBACK,
    variantLabel: variantLabelFromProduct(product, item.variantId) || productView?.variant || '',
    unitPrice: item.unitPriceAmount,
    quantity: item.quantity,
    currency: item.unitPriceCurrency || productView?.currency || 'USD',
    inStock: productView?.inStock !== false,
    selected: true,
  };
}

export function mapCartToPageViewModel(
  cart: CartDto,
  productsById: ReadonlyMap<string, ProductDto>,
  productViewsById: ReadonlyMap<string, ProductViewModel>,
  recommendations: readonly ProductViewModel[],
): CartPageViewModel {
  const lines = cart.items.map((item) =>
    mapCartItemToLine(item, productsById.get(item.productId), productViewsById.get(item.productId)),
  );
  const currency = cart.currency ?? lines[0]?.currency ?? 'USD';

  return {
    crumbs: CART_CRUMBS,
    lines,
    summary: summarizeCart(lines, currency),
    recommendations,
  };
}

export function preserveLineSelection(
  previous: readonly CartLineViewModel[],
  next: readonly CartLineViewModel[],
): CartLineViewModel[] {
  const selected = new Map(previous.map((line) => [line.id, line.selected]));
  return next.map((line) => ({
    ...line,
    selected: selected.get(line.id) ?? line.selected,
  }));
}
