import type { Metadata } from 'next';
import { CheckoutContainer } from '@/components/commerce/checkout/checkout-container';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your order in a few simple steps.',
  robots: { index: false, follow: false },
};

export default function CheckoutRoutePage() {
  return <CheckoutContainer />;
}
