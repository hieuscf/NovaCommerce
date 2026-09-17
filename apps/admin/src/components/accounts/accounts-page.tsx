import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { AccountsFilters } from '@/components/accounts/accounts-filters';
import { AccountsKpiCards } from '@/components/accounts/accounts-kpi-cards';
import { AccountsPagination } from '@/components/accounts/accounts-pagination';
import { AccountsTable } from '@/components/accounts/accounts-table';
import {
  adminAccounts,
  accountsPageMeta,
  filterAccounts,
} from '@/lib/mock-data/accounts';
import { type AccountsQuery } from '@/lib/url/accounts-query';

export function AccountsPage({ query }: { query: AccountsQuery }) {
  const rows = filterAccounts(adminAccounts, query);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="mb-2 text-caption text-muted-foreground">
            <ol className="flex items-center gap-1.5">
              {accountsPageMeta.breadcrumb.map((crumb, index) => (
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
            {accountsPageMeta.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{accountsPageMeta.description}</p>
        </div>

        <Button
          size="sm"
          className="w-fit gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500/90 hover:to-violet-500/90"
        >
          <Plus className="size-4" aria-hidden="true" />
          Create Account
        </Button>
      </div>

      <AccountsKpiCards />
      <AccountsFilters query={query} />

      <div className="space-y-4">
        <AccountsTable accounts={rows} />
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <AccountsPagination query={query} />
        </div>
      </div>
    </div>
  );
}
