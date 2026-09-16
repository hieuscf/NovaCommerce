'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@novacommerce/ui/components/button';
import { Container } from '@novacommerce/ui/components/container';
import { CartErrorState } from '@/components/commerce/cart/cart-error';
import { CartPage } from '@/components/commerce/cart/cart-page';
import { CartSkeleton } from '@/components/commerce/cart/cart-skeleton';
import { useSession } from '@/features/auth/use-session';
import { getCartPage } from '@/lib/cart/get-cart-page';
import { toFormError } from '@/lib/errors';
import type { CartPageViewModel } from '@/lib/view-models/cart';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; cart: CartPageViewModel }
  | { status: 'error'; message: string };

/**
 * Client loader for `/cart`. Auth access tokens live in memory, so the cart
 * must fetch after session restore. Presentation stays in `CartPage`.
 */
export function CartContainer() {
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
        const cart = await getCartPage();
        if (!cancelled) {
          setState({ status: 'ready', cart });
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
  }, [sessionStatus, isAuthenticated, reloadKey]);

  if (sessionStatus === 'loading' || state.status === 'loading') {
    return (
      <div className="bg-page-canvas min-h-svh">
        <CartSkeleton />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="bg-page-canvas min-h-svh">
        <Container className="flex min-h-[60vh] items-center justify-center py-16">
          <CartErrorState
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
        <CartSkeleton />
      </div>
    );
  }

  return <CartPage cart={state.cart} />;
}
