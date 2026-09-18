import Link from 'next/link';
import { Download, Plus } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { OrdersFilters } from '@/components/orders/orders-filters';
import { OrdersKpiCards } from '@/components/orders/orders-kpi-cards';
import { OrdersPagination } from '@/components/orders/orders-pagination';
import { OrdersTable } from '@/components/orders/orders-table';
import { adminOrders, filterOrders, ordersPageMeta } from '@/lib/mock-data/orders';
import { type OrdersQuery } from '@/lib/url/orders-query';

export function OrdersPage({ query }: { query: OrdersQuery }) {
  const rows = filterOrders(adminOrders, query);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="mb-2 text-caption text-muted-foreground">
            <ol className="flex items-center gap-1.5">
              {ordersPageMeta.breadcrumb.map((crumb, index) => (
                <li key={crumb.label} className="flex items-center gap-1.5">
                  {index > 0 ? <span aria-hidden="true">/</span> : null}
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-foreground hover:underline">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-foreground">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {ordersPageMeta.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{ordersPageMeta.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-xl">
            <Download className="size-4" aria-hidden="true" />
            Export
          </Button>
          <Button
            size="sm"
            className="gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500/90 hover:to-violet-500/90"
          >
            <Plus className="size-4" aria-hidden="true" />
            Create Order
          </Button>
        </div>
      </div>

      <OrdersKpiCards />
      <OrdersFilters query={query} />

      <div className="space-y-4">
        <OrdersTable orders={rows} />
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <OrdersPagination query={query} />
        </div>
      </div>
    </div>
  );
}
