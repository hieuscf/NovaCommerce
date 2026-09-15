import Link from 'next/link';
import Image from 'next/image';
import { Package } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Container } from '@novacommerce/ui/components/container';
import { EmptyState } from '@novacommerce/ui/components/empty-state';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  getPaginationRange,
} from '@novacommerce/ui/components/pagination';
import { AccountSidebar } from '@/components/account/account-sidebar';
import { OrderStatusBadge } from '@/components/commerce/orders/order-status-badge';
import { ShopBreadcrumb } from '@/components/commerce/listing/shop-breadcrumb';
import { cn } from '@/lib/utils';
import { ordersHref, type OrdersQuery } from '@/lib/url/orders-query';
import {
  ORDER_STATUS_FILTER_LABELS,
  ORDER_STATUS_FILTERS,
  formatOrderMoney,
  formatOrderNumber,
  itemCountLabel,
  orderHref,
  type OrderListItemViewModel,
  type OrderListPageViewModel,
  type OrderStatusFilter,
} from '@/lib/view-models/order';

export function OrderListPage({
  list,
  query,
}: {
  list: OrderListPageViewModel;
  query: OrdersQuery;
}) {
  return (
    <div className="bg-page-canvas min-h-svh">
      <Container size="wide" className="py-8 lg:py-10">
        <div className="grid items-start gap-5 lg:grid-cols-[248px_minmax(0,1fr)]">
          <AccountSidebar section="orders" />
          <section className="min-w-0 rounded-2xl border border-border/70 bg-surface p-5 shadow-card-soft sm:p-6">
            <ShopBreadcrumb crumbs={list.crumbs} />
            <header className="mt-4">
              <h1 className="text-[32px] font-extrabold tracking-tight text-ink">My Orders</h1>
              <p className="mt-1 text-sm text-copy">Track and manage your orders</p>
            </header>

            <OrderStatusFilters query={query} />

            {list.items.length === 0 ? (
              <OrderListEmpty status={query.status} />
            ) : (
              <ul className="mt-2 divide-y divide-border/70">
                {list.items.map((order) => (
                  <OrderListRow key={order.orderNumber} order={order} />
                ))}
              </ul>
            )}

            <OrderListPagination query={query} page={list.page} totalPages={list.totalPages} total={list.total} />
          </section>
        </div>
      </Container>
    </div>
  );
}

function OrderStatusFilters({ query }: { query: OrdersQuery }) {
  return (
    <nav className="mt-5 mb-2 flex flex-wrap gap-2" aria-label="Filter orders">
      {ORDER_STATUS_FILTERS.map((status) => {
        const active = query.status === status;
        return (
          <Link
            key={status}
            href={ordersHref({ status, page: 1 })}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'inline-flex h-9 items-center rounded-pill px-3.5 text-[12.5px] font-semibold transition-colors',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'border border-border bg-surface text-muted-foreground hover:border-primary/30 hover:text-foreground',
            )}
          >
            {ORDER_STATUS_FILTER_LABELS[status]}
          </Link>
        );
      })}
    </nav>
  );
}

function OrderListRow({ order }: { order: OrderListItemViewModel }) {
  const href = orderHref(order.orderNumber);

  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <OrderThumbnails thumbnails={order.thumbnails} />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[13.5px] font-bold text-ink">{formatOrderNumber(order.orderNumber)}</p>
          <p className="mt-1 truncate text-[11.5px] text-muted-foreground">
            {order.placedAtLabel} · {itemCountLabel(order.itemCount)}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
        <OrderStatusBadge status={order.status} />
        <p className="min-w-[5.5rem] text-right text-[13.5px] font-bold tabular-nums text-ink">
          {formatOrderMoney(order.total, order.currency)}
        </p>
        <Button asChild variant="secondary" size="sm" className="h-9 rounded-xl">
          <Link href={href}>View Details</Link>
        </Button>
      </div>
    </li>
  );
}

function OrderThumbnails({
  thumbnails,
}: {
  thumbnails: OrderListItemViewModel['thumbnails'];
}) {
  const shown = thumbnails.slice(0, 3);

  return (
    <div className="flex shrink-0 -space-x-2" aria-hidden="true">
      {shown.map((thumb, index) => (
        <span
          key={`${thumb.src}-${index}`}
          className="relative size-11 overflow-hidden rounded-xl border-2 border-white bg-surface-subtle shadow-sm"
        >
          <Image src={thumb.src} alt="" fill sizes="44px" className="object-cover" />
        </span>
      ))}
    </div>
  );
}

function OrderListEmpty({ status }: { status: OrderStatusFilter }) {
  const filtered = status !== 'all';

  return (
    <div className="py-6">
      <EmptyState
        icon={<Package className="size-6" />}
        title={filtered ? 'No orders match this filter' : 'No orders yet'}
        description={
          filtered
            ? 'Try another status, or view all of your orders.'
            : 'When you place an order, it will show up here so you can track it.'
        }
        action={
          filtered ? (
            <Button asChild variant="secondary">
              <Link href="/orders">View all orders</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/shop">Continue shopping</Link>
            </Button>
          )
        }
      />
    </div>
  );
}

function OrderListPagination({
  query,
  page,
  totalPages,
  total,
}: {
  query: OrdersQuery;
  page: number;
  totalPages: number;
  total: number;
}) {
  if (total === 0 || totalPages <= 1) {
    return null;
  }

  const items = getPaginationRange({ page, totalPages });

  return (
    <Pagination className="pt-4">
      <PaginationContent className="flex-wrap gap-1">
        <PaginationItem>
          <PaginationPrevious
            href={page <= 1 ? undefined : ordersHref({ ...query, page: page - 1 })}
            disabled={page <= 1}
          />
        </PaginationItem>
        {items.map((item, index) =>
          item === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink asChild isActive={item === page}>
                <Link href={ordersHref({ ...query, page: item })}>{item}</Link>
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href={page >= totalPages ? undefined : ordersHref({ ...query, page: page + 1 })}
            disabled={page >= totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
