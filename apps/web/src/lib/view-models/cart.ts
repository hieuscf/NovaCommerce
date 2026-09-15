import { formatPrice, type ProductViewModel } from '@/lib/view-models/product';
import type { ShopCrumb } from '@/lib/view-models/shop';

/** Presentation estimate until Checkout owns tax. Not a tax engine. */
export const CART_DISPLAY_TAX_RATE = 0.08;

/** Presentation free-shipping threshold until Checkout owns shipping. */
export const CART_FREE_SHIPPING_THRESHOLD = 50;

export interface CartLineViewModel {
  readonly id: string;
  readonly productId: string;
  readonly slug: string;
  readonly name: string;
  readonly imageUrl: string;
  readonly variantLabel: string;
  readonly unitPrice: number;
  readonly quantity: number;
  readonly currency: string;
  readonly inStock: boolean;
  readonly selected: boolean;
}

export interface CartSummaryViewModel {
  readonly itemCount: number;
  readonly selectedCount: number;
  readonly subtotal: number;
  readonly shipping: number;
  readonly tax: number;
  readonly total: number;
  readonly currency: string;
  readonly taxRatePercent: number;
  readonly freeShippingThreshold: number;
  readonly amountToFreeShipping: number;
  readonly freeShippingUnlocked: boolean;
}

export interface CartPageViewModel {
  readonly crumbs: readonly ShopCrumb[];
  readonly lines: readonly CartLineViewModel[];
  readonly summary: CartSummaryViewModel;
  readonly recommendations: readonly ProductViewModel[];
}

export function lineTotal(line: Pick<CartLineViewModel, 'unitPrice' | 'quantity'>): number {
  return roundMoney(line.unitPrice * line.quantity);
}

export function summarizeCart(
  lines: readonly CartLineViewModel[],
  currency = 'USD',
): CartSummaryViewModel {
  const selected = lines.filter((line) => line.selected);
  const subtotal = roundMoney(
    selected.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
  );
  const tax = roundMoney(subtotal * CART_DISPLAY_TAX_RATE);
  const freeShippingUnlocked = subtotal >= CART_FREE_SHIPPING_THRESHOLD;
  const shipping = 0;
  const amountToFreeShipping = freeShippingUnlocked
    ? 0
    : roundMoney(Math.max(0, CART_FREE_SHIPPING_THRESHOLD - subtotal));

  return {
    itemCount: lines.length,
    selectedCount: selected.length,
    subtotal,
    shipping,
    tax,
    total: roundMoney(subtotal + shipping + tax),
    currency,
    taxRatePercent: Math.round(CART_DISPLAY_TAX_RATE * 100),
    freeShippingThreshold: CART_FREE_SHIPPING_THRESHOLD,
    amountToFreeShipping,
    freeShippingUnlocked,
  };
}

export function formatCartMoney(amount: number, currency = 'USD'): string {
  return formatPrice(amount, currency);
}

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}
