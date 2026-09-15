import {
  checkoutCountries,
  checkoutCustomerFixture,
  checkoutPaymentMethods,
  checkoutRegionsByCountry,
  checkoutShippingFixture,
} from '@/lib/mock-data/checkout';
import { getCartPage } from '@/lib/cart/get-cart-page';
import type { CartFixtureLine } from '@/lib/mock-data/cart';
import { summarizeCart } from '@/lib/view-models/cart';
import { checkoutCrumbsForStage, type CheckoutPageViewModel } from '@/lib/view-models/checkout';

/**
 * Presentation lookup for the checkout page. Replace with Cart / User /
 * Checkout Gateway adapters later. Unknown cart lines are skipped.
 * Unexpected failures must throw so `checkout/error.tsx` can render `ErrorState`.
 * An empty selected cart is a valid empty checkout.
 */
export function getCheckoutPage(
  cartFixtures?: readonly CartFixtureLine[],
): CheckoutPageViewModel {
  const cart = getCartPage(cartFixtures);
  const lines = cart.lines.filter((line) => line.selected);

  return {
    crumbs: checkoutCrumbsForStage('details'),
    customer: checkoutCustomerFixture,
    shipping: checkoutShippingFixture,
    lines,
    summary: summarizeCart(lines),
    paymentMethods: checkoutPaymentMethods,
    countries: checkoutCountries,
    regionsByCountry: checkoutRegionsByCountry,
  };
}
