import { CheckoutSkeleton } from '@/components/commerce/checkout/checkout-skeleton';

export default function CheckoutLoading() {
  return (
    <div className="bg-page-canvas min-h-svh">
      <CheckoutSkeleton />
    </div>
  );
}
