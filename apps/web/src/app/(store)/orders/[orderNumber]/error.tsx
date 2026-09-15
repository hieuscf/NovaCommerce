'use client';

import { useEffect } from 'react';
import { reportFrontendEvent } from '@novacommerce/frontend';
import { Button } from '@novacommerce/ui/components/button';
import { Container } from '@novacommerce/ui/components/container';
import { OrderErrorState } from '@/components/commerce/orders/order-states';

export default function OrderDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportFrontendEvent({
      level: 'error',
      event: 'orders.detail_route_error',
      context: { digest: error.digest },
    });
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] items-center justify-center py-16">
      <OrderErrorState
        action={
          <Button type="button" onClick={reset}>
            Try again
          </Button>
        }
      />
    </Container>
  );
}
