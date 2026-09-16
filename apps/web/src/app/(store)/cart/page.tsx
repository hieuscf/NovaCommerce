import type { Metadata } from 'next';
import { CartContainer } from '@/components/commerce/cart/cart-container';

export const metadata: Metadata = {
  title: 'Shopping Cart',
  description: 'Review your items and manage your cart before checkout.',
};

export default function CartRoutePage() {
  return <CartContainer />;
}
