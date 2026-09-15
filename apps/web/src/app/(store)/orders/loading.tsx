import { OrderListSkeleton } from '@/components/commerce/orders/order-skeleton';

export default function OrdersLoading() {
  return (
    <div className="bg-page-canvas min-h-svh">
      <OrderListSkeleton />
    </div>
  );
}
