'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Input } from '@novacommerce/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@novacommerce/ui/components/select';
import {
  ordersHref,
  type OrdersDateRangeFilter,
  type OrdersPaymentFilter,
  type OrdersQuery,
  type OrdersStatusFilter,
} from '@/lib/url/orders-query';

export function OrdersFilters({ query }: { query: OrdersQuery }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function navigate(next: Partial<OrdersQuery>) {
    startTransition(() => {
      router.push(ordersHref({ ...query, page: 1, ...next }));
    });
  }

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm lg:flex-row lg:items-center"
      data-pending={pending || undefined}
    >
      <div className="min-w-0 flex-1">
        <Input
          key={query.q ?? ''}
          type="search"
          name="q"
          defaultValue={query.q ?? ''}
          placeholder="Search by order ID, customer, product, or seller..."
          aria-label="Search orders"
          startAdornment={<Search className="size-4 text-muted-foreground" aria-hidden="true" />}
          className="h-10"
          groupClassName="rounded-xl"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              navigate({ q: event.currentTarget.value });
            }
          }}
        />
      </div>

      <Select
        value={query.status}
        onValueChange={(value) => navigate({ status: value as OrdersStatusFilter })}
      >
        <SelectTrigger className="h-10 w-full lg:w-40" aria-label="Filter by order status">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="processing">Processing</SelectItem>
          <SelectItem value="shipped">Shipped</SelectItem>
          <SelectItem value="delivered">Delivered</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={query.payment}
        onValueChange={(value) => navigate({ payment: value as OrdersPaymentFilter })}
      >
        <SelectTrigger className="h-10 w-full lg:w-48" aria-label="Filter by payment status">
          <SelectValue placeholder="All Payment Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Payment Statuses</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
          <SelectItem value="refunded">Refunded</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={query.range}
        onValueChange={(value) => navigate({ range: value as OrdersDateRangeFilter })}
      >
        <SelectTrigger className="h-10 w-full lg:w-44" aria-label="Filter by date range">
          <SelectValue placeholder="Last 30 days" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="last_7_days">Last 7 days</SelectItem>
          <SelectItem value="last_30_days">Last 30 days</SelectItem>
          <SelectItem value="last_90_days">Last 90 days</SelectItem>
          <SelectItem value="all">All time</SelectItem>
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-10 gap-1.5 rounded-xl"
        onClick={() =>
          navigate({
            q: undefined,
            status: 'all',
            payment: 'all',
            range: 'last_30_days',
          })
        }
      >
        <RotateCcw className="size-3.5" aria-hidden="true" />
        Reset
      </Button>
    </div>
  );
}
