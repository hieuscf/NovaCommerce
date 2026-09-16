'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@novacommerce/ui/components/button';
import { Container } from '@novacommerce/ui/components/container';
import { OrderListPage } from '@/components/commerce/orders/order-list-page';
import { OrderListSkeleton } from '@/components/commerce/orders/order-skeleton';
import { OrderErrorState } from '@/components/commerce/orders/order-states';
import { useSession } from '@/features/auth/use-session';
import { toFormError } from '@/lib/errors';
import { getOrderListPage } from '@/lib/orders/get-order-list';
import type { OrdersQuery } from '@/lib/url/orders-query';
import type { OrderListPageViewModel } from '@/lib/view-models/order';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; list: OrderListPageViewModel }
  | { status: 'error'; message: string };

/**
 * Client loader for `/orders`. Auth access tokens live in memory, so the list
 * must fetch after session restore. Presentation stays in `OrderListPage`.
 */
export function OrderListContainer({ query }: { query: OrdersQuery }) {
  const { status: sessionStatus, isAuthenticated } = useSession();
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  useEffect(() => {
    if (sessionStatus === 'loading') {
      return;
    }
    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;
    setState({ status: 'loading' });

    void (async () => {
      try {
        const list = await getOrderListPage(query);
        if (!cancelled) {
          setState({ status: 'ready', list });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ status: 'error', message: toFormError(error) });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [query.status, query.page, sessionStatus, isAuthenticated, reloadKey]);

  if (sessionStatus === 'loading' || state.status === 'loading') {
    return (
      <div className="bg-page-canvas min-h-svh">
        <OrderListSkeleton />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="bg-page-canvas min-h-svh">
        <Container className="flex min-h-[60vh] items-center justify-center py-16">
          <OrderErrorState
            title="Could not load your orders"
            description={state.message}
            action={
              <Button type="button" onClick={reload}>
                Try again
              </Button>
            }
          />
        </Container>
      </div>
    );
  }

  if (state.status !== 'ready') {
    return (
      <div className="bg-page-canvas min-h-svh">
        <OrderListSkeleton />
      </div>
    );
  }

  return <OrderListPage list={state.list} query={query} />;
}
