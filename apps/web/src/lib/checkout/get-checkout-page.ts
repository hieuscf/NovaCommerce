import {
  checkoutCountries,
  checkoutCustomerFixture,
  checkoutPaymentMethods,
  checkoutRegionsByCountry,
  checkoutShippingFixture,
} from '@/lib/mock-data/checkout';
import { getCartPage, getCartPageFromFixtures } from '@/lib/cart/get-cart-page';
import type { CartFixtureLine } from '@/lib/mock-data/cart';
import { userClient } from '@/lib/user/client';
import type { UserAddressDto, UserProfileDto } from '@/lib/user/types';
import { summarizeCart } from '@/lib/view-models/cart';
import {
  checkoutCrumbsForStage,
  type CheckoutCustomerViewModel,
  type CheckoutPageViewModel,
  type CheckoutShippingViewModel,
} from '@/lib/view-models/checkout';

function mapProfileToCustomer(profile: UserProfileDto | null): CheckoutCustomerViewModel {
  if (!profile) {
    return checkoutCustomerFixture;
  }

  return {
    fullName: profile.displayName || checkoutCustomerFixture.fullName,
    email: checkoutCustomerFixture.email,
    phone: profile.phoneNumber ?? checkoutCustomerFixture.phone,
    createAccount: false,
  };
}

function mapAddressToShipping(address: UserAddressDto | undefined): CheckoutShippingViewModel {
  if (!address) {
    return checkoutShippingFixture;
  }

  return {
    addressLine1: address.line1,
    addressLine2: address.line2 ?? '',
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
  };
}

/**
 * Sync fixture builder for checkout / UI tests until those surfaces use live data.
 * Unexpected failures must throw so `checkout/error.tsx` can render `ErrorState`.
 * An empty selected cart is a valid empty checkout.
 */
export function getCheckoutPage(
  cartFixtures?: readonly CartFixtureLine[],
): CheckoutPageViewModel {
  const cart = getCartPageFromFixtures(cartFixtures);
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

/**
 * Loads checkout from Gateway cart + User profile/addresses.
 * Payment method tiles stay presentation fixtures (mapped at place-order time).
 */
export async function getCheckoutPageFromGateway(): Promise<CheckoutPageViewModel> {
  const cart = await getCartPage();
  const lines = cart.lines.filter((line) => line.selected);

  let profile: UserProfileDto | null = null;
  let addresses: UserAddressDto[] = [];

  try {
    profile = await userClient.getProfile();
  } catch {
    profile = null;
  }

  try {
    addresses = await userClient.getAddresses();
  } catch {
    addresses = [];
  }

  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];

  return {
    crumbs: checkoutCrumbsForStage('details'),
    customer: mapProfileToCustomer(profile),
    shipping: mapAddressToShipping(defaultAddress),
    lines,
    summary: summarizeCart(lines),
    paymentMethods: checkoutPaymentMethods,
    countries: checkoutCountries,
    regionsByCountry: checkoutRegionsByCountry,
  };
}
