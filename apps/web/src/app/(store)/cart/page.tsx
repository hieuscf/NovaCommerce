import type { Metadata } from 'next';
import { CartPage } from '@/components/commerce/cart/cart-page';
import { getCartPage } from '@/lib/cart/get-cart-page';

export const metadata: Metadata = {
  title: 'Shopping Cart',
  description: 'Review your items and manage your cart before checkout.',
};

export default function CartRoutePage() {
  const cart = getCartPage();
  return <CartPage cart={cart} />;
}
