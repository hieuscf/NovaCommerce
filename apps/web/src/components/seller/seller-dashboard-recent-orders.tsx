import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@novacommerce/ui/components/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@novacommerce/ui/components/card';
import {
  sellerOrderStatusLabel,
  sellerRecentOrders,
  type SellerOrderStatus,
} from '@/lib/mock-data/seller-dashboard';

function OrderStatusBadge({ status }: { status: SellerOrderStatus }) {
  if (status === 'delivered') {
    return (
      <Badge variant="success" className="rounded-full">
        {sellerOrderStatusLabel[status]}
      </Badge>
    );
  }
  if (status === 'awaiting_pickup') {
    return (
      <Badge variant="secondary" className="rounded-full bg-violet-500/15 text-violet-700">
        {sellerOrderStatusLabel[status]}
      </Badge>
    );
  }
  return (
    <Badge variant="warning" className="rounded-full">
      {sellerOrderStatusLabel[status]}
    </Badge>
  );
}

export function SellerDashboardRecentOrders() {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">Đơn hàng gần đây</CardTitle>
        <Link
          href="/seller?demo=registered#orders"
          className="text-sm font-semibold text-sky-600 hover:underline"
        >
          Xem tất cả →
        </Link>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="divide-y divide-border">
          {sellerRecentOrders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/seller?demo=registered#orders`}
                className="flex items-center gap-3 py-3 transition-colors hover:bg-slate-50/80"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-sky-700">{order.orderNumber}</p>
                  <p className="truncate text-caption text-muted-foreground">{order.customer}</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-foreground">{order.total}</p>
                </div>
                <OrderStatusBadge status={order.status} />
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
