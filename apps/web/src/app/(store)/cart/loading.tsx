import { CartSkeleton } from '@/components/commerce/cart/cart-skeleton';

export default function CartLoading() {
  return (
    <div className="bg-page-canvas min-h-svh">
      <CartSkeleton />
    </div>
  );
}
