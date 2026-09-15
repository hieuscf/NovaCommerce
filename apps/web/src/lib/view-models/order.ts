import { formatPrice } from '@/lib/view-models/product';
import type { ShopCrumb } from '@/lib/view-models/shop';

/**
 * Storefront fulfillment labels for Alloy order UI.
 * These are presentation-only and are not domain `OrderStatus`
 * (`pending` | `confirmed` | `cancelled` | `completed`).
 */
export const ORDER_LIST_STATUSES = ['processing', 'shipped', 'delivered', 'cancelled'] as const;

export type OrderListStatus = (typeof ORDER_LIST_STATUSES)[number];

export const ORDER_STATUS_FILTERS = ['all', ...ORDER_LIST_STATUSES] as const;

export type OrderStatusFilter = (typeof ORDER_STATUS_FILTERS)[number];

export const ORDER_TIMELINE_STEP_IDS = [
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
] as const;

export type OrderTimelineStepId = (typeof ORDER_TIMELINE_STEP_IDS)[number];

export type OrderStepState = 'complete' | 'current' | 'pending';

export const ORDER_LIST_STATUS_LABELS: Record<OrderListStatus, string> = {
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_FILTER_LABELS: Record<OrderStatusFilter, string> = {
  all: 'All',
  ...ORDER_LIST_STATUS_LABELS,
};

export const ORDER_PAGE_SIZE = 5;

export interface OrderAddressViewModel {
  readonly recipient: string;
  readonly line1: string;
  readonly line2: string;
  readonly phone: string;
}

export interface OrderPaymentViewModel {
  readonly brand: string;
  readonly last4: string;
  readonly paidAtLabel: string;
  readonly status: 'paid' | 'pending';
}

export interface OrderShipmentViewModel {
  readonly methodLabel: string;
  readonly trackingNumber?: string;
  readonly carrier?: string;
}

export interface OrderItemViewModel {
  readonly id: string;
  readonly productId: string;
  readonly slug: string;
  readonly name: string;
  readonly variantLabel: string;
  readonly imageUrl: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly lineTotal: number;
  readonly currency: string;
}

export interface OrderSummaryViewModel {
  readonly itemCount: number;
  readonly subtotal: number;
  readonly shipping: number;
  readonly tax: number;
  readonly total: number;
  readonly currency: string;
  readonly taxRatePercent: number;
}

export interface OrderTimelineStepViewModel {
  readonly id: OrderTimelineStepId;
  readonly label: string;
  readonly atLabel?: string;
  readonly note?: string;
  readonly state: OrderStepState;
}

export interface OrderListItemViewModel {
  readonly orderNumber: string;
  readonly placedAtLabel: string;
  readonly itemCount: number;
  readonly total: number;
  readonly currency: string;
  readonly status: OrderListStatus;
  readonly thumbnails: readonly { src: string; alt: string }[];
}

export interface OrderListPageViewModel {
  readonly crumbs: readonly ShopCrumb[];
  readonly status: OrderStatusFilter;
  readonly page: number;
  readonly totalPages: number;
  readonly total: number;
  readonly items: readonly OrderListItemViewModel[];
}

export interface OrderDetailViewModel {
  readonly orderNumber: string;
  readonly placedAtLabel: string;
  readonly status: OrderListStatus;
  readonly timeline: readonly OrderTimelineStepViewModel[];
  readonly items: readonly OrderItemViewModel[];
  readonly shipping: OrderShipmentViewModel;
  readonly address: OrderAddressViewModel;
  readonly payment: OrderPaymentViewModel;
  readonly summary: OrderSummaryViewModel;
  readonly crumbs: readonly ShopCrumb[];
}

export interface OrderConfirmedViewModel {
  readonly orderNumber: string;
  readonly placedAtLabel: string;
  readonly progress: readonly OrderTimelineStepViewModel[];
  readonly summary: OrderSummaryViewModel;
  readonly paymentLabel: string;
  readonly shippingMethodLabel: string;
  readonly address: OrderAddressViewModel;
  readonly detailHref: string;
}

export function normalizeOrderNumber(value: string): string {
  return value.trim().replace(/^#/, '').toUpperCase();
}

export function formatOrderNumber(orderNumber: string): string {
  const normalized = normalizeOrderNumber(orderNumber);
  return normalized ? `#${normalized}` : '';
}

export function orderHref(orderNumber: string): string {
  return `/orders/${encodeURIComponent(normalizeOrderNumber(orderNumber))}`;
}

export function formatOrderMoney(amount: number, currency = 'USD'): string {
  return formatPrice(amount, currency);
}

export function itemCountLabel(count: number): string {
  return count === 1 ? '1 item' : `${count} items`;
}

export function isOrderListStatus(value: string | undefined): value is OrderListStatus {
  return ORDER_LIST_STATUSES.some((status) => status === value);
}

export function isOrderStatusFilter(value: string | undefined): value is OrderStatusFilter {
  return ORDER_STATUS_FILTERS.some((status) => status === value);
}

export function paymentMaskedLabel(payment: OrderPaymentViewModel): string {
  return `${payment.brand} **** ${payment.last4}`;
}
