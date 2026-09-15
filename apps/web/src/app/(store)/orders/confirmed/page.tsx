import type { Metadata } from 'next';
import { OrderConfirmedPage } from '@/components/commerce/orders/order-confirmed-page';
import { getOrderConfirmed } from '@/lib/orders/get-order-confirmed';

export const metadata: Metadata = {
  title: 'Order Confirmed',
  description: 'Thank you for your purchase. Your order has been placed successfully.',
  robots: { index: false, follow: false },
};

export default function OrderConfirmedRoutePage() {
  const confirmation = getOrderConfirmed();
  return <OrderConfirmedPage confirmation={confirmation} />;
}
