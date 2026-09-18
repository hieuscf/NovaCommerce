'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { ErrorState } from '@novacommerce/ui/components/error-state';
import { AccountsFilters } from '@/components/accounts/accounts-filters';
import { AccountsKpiCards } from '@/components/accounts/accounts-kpi-cards';
import { AccountsPagination } from '@/components/accounts/accounts-pagination';
import { AccountsTable } from '@/components/accounts/accounts-table';
import { useAdminSession } from '@/features/auth/use-session';
import {
  ACCOUNT_PAGE_SIZE,
  buildAccountsPageViewModel,
  type AccountsPageViewModel,
} from '@/lib/identity/get-accounts-page';
import { identitiesClient } from '@/lib/identity/identities-client';
import { signOut } from '@/lib/auth/session';
import { toFormError } from '@/lib/errors';
import { isApiClientError } from '@novacommerce/frontend';
import { type AccountsQuery } from '@/lib/url/accounts-query';
import AccountsLoading from '@/app/(console)/accounts/loading';

const pageMeta = {
  title: 'Account Management',
  description: 'Manage user accounts, roles and permissions across your platform.',
  breadcrumb: [
    { label: 'Home', href: '/' },
    { label: 'Accounts' },
  ],
} as const;

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; view: AccountsPageViewModel }
  | { status: 'error'; message: string };

export function AccountsPage({ query }: { query: AccountsQuery }) {
  const session = useAdminSession();
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!session.isAuthenticated) {
      return;
    }

    let cancelled = false;
    setState({ status: 'loading' });

    void (async () => {
      try {
        const list = await identitiesClient.listIdentities({
          q: query.q,
          status: query.status === 'all' ? undefined : query.status,
          page: query.page,
          pageSize: ACCOUNT_PAGE_SIZE,
        });
        if (cancelled) return;
        setState({ status: 'ready', view: buildAccountsPageViewModel(list) });
      } catch (error) {
        if (cancelled) return;
        if (isApiClientError(error) && error.status === 401) {
          signOut();
          return;
        }
        setState({ status: 'error', message: toFormError(error) });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [query.q, query.status, query.page, session.isAuthenticated, reloadKey]);

  if (!session.isAuthenticated || state.status === 'loading') {
    return <AccountsLoading />;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-6">
        <AccountsPageHeader />
        <ErrorState
          title="Could not load accounts"
          description={state.message}
          action={
            <Button type="button" onClick={reload}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  const { view } = state;

  return (
    <div className="space-y-6">
      <AccountsPageHeader />
      <AccountsKpiCards kpis={view.kpis} />
      <AccountsFilters query={query} />
      <div className="space-y-4">
        <AccountsTable accounts={view.rows} onAccountUpdated={reload} />
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <AccountsPagination
            query={query}
            page={view.page}
            pageSize={view.pageSize}
            total={view.total}
            totalPages={view.totalPages}
          />
        </div>
      </div>
    </div>
  );
}

function AccountsPageHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <nav aria-label="Breadcrumb" className="mb-2 text-caption text-muted-foreground">
          <ol className="flex items-center gap-1.5">
            {pageMeta.breadcrumb.map((crumb, index) => (
              <li key={crumb.label} className="flex items-center gap-1.5">
                {index > 0 ? <span aria-hidden="true">/</span> : null}
                {'href' in crumb && crumb.href ? (
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
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{pageMeta.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{pageMeta.description}</p>
      </div>

      <Button
        size="sm"
        className="w-fit gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500/90 hover:to-violet-500/90"
      >
        <Plus className="size-4" aria-hidden="true" />
        Create Account
      </Button>
    </div>
  );
}
