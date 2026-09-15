'use client';

import { useEffect } from 'react';
import { reportFrontendEvent } from '@novacommerce/frontend';
import { Button } from '@novacommerce/ui/components/button';
import { Container } from '@novacommerce/ui/components/container';
import { ProductDetailErrorState } from '@/components/commerce/product-detail/product-detail-error';

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportFrontendEvent({
      level: 'error',
      event: 'product.route_error',
      context: { digest: error.digest },
    });
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] items-center justify-center py-16">
      <ProductDetailErrorState
        action={
          <Button type="button" onClick={reset}>
            Try again
          </Button>
        }
      />
    </Container>
  );
}
