'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@novacommerce/ui/components/button';
import { Container } from '@novacommerce/ui/components/container';
import { CheckoutErrorState } from '@/components/commerce/checkout/checkout-error';
import { CheckoutPage } from '@/components/commerce/checkout/checkout-page';
import { CheckoutSkeleton } from '@/components/commerce/checkout/checkout-skeleton';
import { useSession } from '@/features/auth/use-session';
import { getCheckoutPageFromGateway } from '@/lib/checkout/get-checkout-page';
import { toFormError } from '@/lib/errors';
import type { CheckoutPageViewModel } from '@/lib/view-models/checkout';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; checkout: CheckoutPageViewModel }
  | { status: 'error'; message: string };

/**
 * Client loader for `/checkout`. Auth access tokens live in memory, so cart and
 * profile must fetch after session restore. Presentation stays in `CheckoutPage`.
 */
export function CheckoutContainer() {
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
        const checkout = await getCheckoutPageFromGateway();
        if (!cancelled) {
          setState({ status: 'ready', checkout });
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
        <CheckoutSkeleton />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="bg-page-canvas min-h-svh">
        <Container className="flex min-h-[60vh] items-center justify-center py-16">
          <CheckoutErrorState
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
        <CheckoutSkeleton />
      </div>
    );
  }

  return <CheckoutPage checkout={state.checkout} />;
}
