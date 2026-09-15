import { CheckCircle2, Clock, Truck } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@novacommerce/ui/components/badge';
import { Button } from '@novacommerce/ui/components/button';
import { ProductShape } from '@/components/commerce/product-shape';
import { accountOrders } from '@/lib/mock-data/account';
import { orderHref } from '@/lib/view-models/order';
import { type AccountOrderStatus } from '@/lib/view-models/account';
import { AccountCard } from './account-card';
import { AccountSectionHeading } from './account-section-heading';

const STATUS_BADGE: Record<
  AccountOrderStatus,
  { variant: 'success' | 'info' | 'warning'; icon: typeof CheckCircle2 }
> = {
  Delivered: { variant: 'success', icon: CheckCircle2 },
  Shipped: { variant: 'info', icon: Truck },
  Processing: { variant: 'warning', icon: Clock },
};

function itemLabel(count: number): string {
  return count === 1 ? '1 item' : `${count} items`;
}

export function AccountRecentOrders() {
  return (
    <AccountCard padded={false}>
      <div className="px-5 pt-5">
        <AccountSectionHeading title="Recent Orders" action="View All" href="/orders" />
      </div>
      <ul className="mt-2 flex flex-col">
        {accountOrders.map((order) => {
          const status = STATUS_BADGE[order.status];
          const StatusIcon = status.icon;
          return (
            <li
              key={order.id}
              className="flex flex-col gap-3 border-t border-border/60 px-5 py-3.5 first:border-t-0 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="nova-shot relative size-[54px] shrink-0 rounded-xl">
                  <ProductShape shape={order.shape} />
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-[13px] font-bold text-foreground">{order.id}</p>
                  <p className="mt-1 truncate text-[11px] text-muted-foreground">
                    {order.date} • {itemLabel(order.itemCount)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                <p className="shrink-0 text-[13.5px] font-bold text-foreground sm:w-[86px]">
                  {order.total}
                </p>
                <Badge variant={status.variant} className="shrink-0">
                  <StatusIcon aria-hidden="true" />
                  {order.status}
                </Badge>
                <Button asChild variant="secondary" size="sm" className="h-9 rounded-xl">
                  <Link href={orderHref(order.id)}>View Details</Link>
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="h-3" />
    </AccountCard>
  );
}
