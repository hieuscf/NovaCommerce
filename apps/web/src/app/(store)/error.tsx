'use client';

import { useEffect } from 'react';
import { Button } from '@novacommerce/ui/components/button';
import { Container } from '@novacommerce/ui/components/container';
import { ErrorState } from '@novacommerce/ui/components/error-state';
import { AlertTriangle } from 'lucide-react';
import { reportFrontendEvent } from '@novacommerce/frontend';

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportFrontendEvent({
      level: 'error',
      event: 'store.route_error',
      context: { digest: error.digest },
    });
  }, [error]);

  return (
    <Container className="py-16">
      <ErrorState
        icon={<AlertTriangle className="size-6" />}
        title="We couldn't load this page"
        description="Please try again. If the problem continues, come back later."
        action={
          <Button type="button" onClick={reset}>
            Try again
          </Button>
        }
      />
    </Container>
  );
}
