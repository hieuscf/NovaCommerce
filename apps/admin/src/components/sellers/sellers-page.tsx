import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { SellersFilters } from '@/components/sellers/sellers-filters';
import { SellersKpiCards } from '@/components/sellers/sellers-kpi-cards';
import { SellersPagination } from '@/components/sellers/sellers-pagination';
import { SellersTable } from '@/components/sellers/sellers-table';
import { adminSellers, filterSellers, sellersPageMeta } from '@/lib/mock-data/sellers';
import { type SellersQuery } from '@/lib/url/sellers-query';

export function SellersPage({ query }: { query: SellersQuery }) {
  const rows = filterSellers(adminSellers, query);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="mb-2 text-caption text-muted-foreground">
            <ol className="flex items-center gap-1.5">
              {sellersPageMeta.breadcrumb.map((crumb, index) => (
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
            {sellersPageMeta.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{sellersPageMeta.description}</p>
        </div>

        <Button
          size="sm"
          className="w-fit gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500/90 hover:to-violet-500/90"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add Seller
        </Button>
      </div>

      <SellersKpiCards />
      <SellersFilters query={query} />

      <div className="space-y-4">
        <SellersTable sellers={rows} />
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <SellersPagination query={query} />
        </div>
      </div>
    </div>
  );
}
