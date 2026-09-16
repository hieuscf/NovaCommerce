/**
 * Gateway Checkout DTOs (`POST /users/me/checkout`).
 * Field names match `apps/gateway/src/checkout/dto/*`.
 */

import type { CheckoutPaymentProvider } from '@/lib/view-models/checkout';

export interface StartCheckoutRequest {
  readonly warehouseId: string;
  readonly shippingAddressId: string;
  readonly couponCode?: string;
}

export interface CompleteCheckoutRequest {
  readonly warehouseId: string;
  readonly shippingAddressId: string;
  readonly paymentProvider: CheckoutPaymentProvider;
}

export interface CheckoutLineDto {
  readonly id: string;
  readonly productId: string;
  readonly variantId?: string;
  readonly quantity: number;
  readonly unitPriceAmount: number;
  readonly currency: string;
  readonly lineTotalAmount: number;
}

export interface CheckoutAdjustmentDto {
  readonly id: string;
  readonly type: string;
  readonly label: string;
  readonly amount: number;
  readonly currency: string;
}

export interface CheckoutSessionDto {
  readonly id: string;
  readonly cartId: string;
  readonly customerId?: string;
  readonly status: string;
  readonly lines: readonly CheckoutLineDto[];
  readonly adjustments: readonly CheckoutAdjustmentDto[];
  readonly subtotalAmount: number;
  readonly totalAmount: number;
  readonly currency?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CheckoutPaymentDto {
  readonly paymentId: string;
  readonly provider: string;
  readonly redirectUrl: string;
}

export interface CompleteCheckoutDto extends CheckoutSessionDto {
  readonly orderId: string;
  readonly orderNumber: string;
  readonly payment: CheckoutPaymentDto;
}

export interface ICheckoutClient {
  startCheckout(body: StartCheckoutRequest): Promise<CheckoutSessionDto>;
  completeCheckout(sessionId: string, body: CompleteCheckoutRequest): Promise<CompleteCheckoutDto>;
}
