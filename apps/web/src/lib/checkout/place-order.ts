import { isApiClientError } from '@novacommerce/frontend';
import { checkoutClient } from '@/lib/checkout/client';
import { DEFAULT_CHECKOUT_WAREHOUSE_ID } from '@/lib/checkout/constants';
import type { CompleteCheckoutDto } from '@/lib/checkout/types';
import { userClient } from '@/lib/user/client';
import type { AddressRequest } from '@/lib/user/types';
import type { CheckoutFormValues } from '@/lib/validation/checkout-schemas';
import {
  toCheckoutPaymentProvider,
  type CheckoutPaymentMethodId,
} from '@/lib/view-models/checkout';

async function ensureCustomerProfile(displayName: string, phone?: string): Promise<void> {
  try {
    await userClient.getAccount();
  } catch (error) {
    if (!isApiClientError(error) || error.status !== 404) {
      throw error;
    }
    await userClient.createProfile({
      displayName: displayName.trim() || 'Customer',
      phoneNumber: phone?.trim() || undefined,
    });
  }
}

function toAddressRequest(values: CheckoutFormValues): AddressRequest {
  return {
    label: 'Shipping',
    line1: values.addressLine1,
    line2: values.addressLine2.trim() ? values.addressLine2 : undefined,
    city: values.city,
    state: values.state,
    postalCode: values.postalCode,
    country: values.country,
    isDefault: true,
  };
}

/**
 * Upserts the customer's shipping address from the Alloy checkout form so
 * Gateway `shippingAddressId` is a real User address UUID.
 */
export async function resolveShippingAddressId(values: CheckoutFormValues): Promise<string> {
  await ensureCustomerProfile(values.fullName, values.phone);
  const payload = toAddressRequest(values);
  const addresses = await userClient.getAddresses();
  const existing = addresses.find((address) => address.isDefault) ?? addresses[0];

  if (existing) {
    const updated = await userClient.updateAddress(existing.id, payload);
    return updated.id;
  }

  const created = await userClient.addAddress(payload);
  return created.id;
}

export interface PlaceCheckoutOrderInput {
  readonly values: CheckoutFormValues;
  readonly paymentMethod: CheckoutPaymentMethodId;
  readonly warehouseId?: string;
}

/**
 * Starts and completes Gateway checkout so an Order exists for `GET /users/me/orders`.
 * Card/OTP fields stay in the browser and are never posted.
 */
export async function placeCheckoutOrder(
  input: PlaceCheckoutOrderInput,
): Promise<CompleteCheckoutDto> {
  const warehouseId = input.warehouseId ?? DEFAULT_CHECKOUT_WAREHOUSE_ID;
  const shippingAddressId = await resolveShippingAddressId(input.values);
  const paymentProvider = toCheckoutPaymentProvider(input.paymentMethod);

  const session = await checkoutClient.startCheckout({
    warehouseId,
    shippingAddressId,
  });

  return checkoutClient.completeCheckout(session.id, {
    warehouseId,
    shippingAddressId,
    paymentProvider,
  });
}
