import { CONFIRMED_ORDER_NUMBER, orderConfirmedProgress } from '@/lib/mock-data/orders';
import { getOrderDetail } from '@/lib/orders/get-order-detail';
import {
  orderHref,
  paymentMaskedLabel,
  type OrderConfirmedViewModel,
} from '@/lib/view-models/order';

/**
 * Presentation lookup for the post-checkout confirmation page. Replace with
 * the Checkout / Order Gateway response later. This preview always shows the
 * Alloy fixture order and does not call `POST /users/me/checkout`.
 */
export function getOrderConfirmed(): OrderConfirmedViewModel {
  const detail = getOrderDetail(CONFIRMED_ORDER_NUMBER);
  if (!detail) {
    throw new Error('Confirmed order fixture is missing');
  }

  return {
    orderNumber: detail.orderNumber,
    placedAtLabel: detail.placedAtLabel,
    progress: orderConfirmedProgress,
    summary: detail.summary,
    paymentLabel: paymentMaskedLabel(detail.payment),
    shippingMethodLabel: detail.shipping.methodLabel,
    address: detail.address,
    detailHref: orderHref(detail.orderNumber),
  };
}
