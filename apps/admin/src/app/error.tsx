'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { ErrorState } from '@novacommerce/ui/components/error-state';
import { reportFrontendEvent } from '@novacommerce/frontend';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportFrontendEvent({
      level: 'error',
      event: 'admin.app_error',
      context: { digest: error.digest },
    });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <ErrorState
        icon={<AlertTriangle className="size-6" />}
        title="Something went wrong"
        description="Please try again. If the problem continues, come back later."
        action={
          <Button type="button" onClick={reset}>
            Try again
          </Button>
        }
      />
    </div>
  );
}
