import type { Metadata } from 'next';
import { CheckoutPage } from '@/components/commerce/checkout/checkout-page';
import { getCheckoutPage } from '@/lib/checkout/get-checkout-page';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your order in a few simple steps.',
  robots: { index: false, follow: false },
};

export default function CheckoutRoutePage() {
  const checkout = getCheckoutPage();
  return <CheckoutPage checkout={checkout} />;
}
