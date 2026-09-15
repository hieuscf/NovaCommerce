'use client';

import { useEffect } from 'react';
import { reportFrontendEvent } from '@novacommerce/frontend';
import { Button } from '@novacommerce/ui/components/button';
import { Container } from '@novacommerce/ui/components/container';
import { OrderErrorState } from '@/components/commerce/orders/order-states';

export default function OrdersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportFrontendEvent({
      level: 'error',
      event: 'orders.route_error',
      context: { digest: error.digest },
    });
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] items-center justify-center py-16">
      <OrderErrorState
        title="Could not load your orders"
        description="Something went wrong on our side. Please try again."
        action={
          <Button type="button" onClick={reset}>
            Try again
          </Button>
        }
      />
    </Container>
  );
}
