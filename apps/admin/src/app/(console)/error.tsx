'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { ErrorState } from '@novacommerce/ui/components/error-state';
import { reportFrontendEvent } from '@novacommerce/frontend';

export default function ConsoleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportFrontendEvent({
      level: 'error',
      event: 'admin.route_error',
      context: { digest: error.digest },
    });
  }, [error]);

  return (
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
  );
}
