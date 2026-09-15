import type { ReactNode } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { ErrorState } from '@novacommerce/ui/components/error-state';

/**
 * Catalog listing load failure. Distinct from empty matches (`ProductListingEmptyState`).
 */
export function ProductListingErrorState({ action }: { action: ReactNode }) {
  return (
    <ErrorState
      icon={<AlertTriangle className="size-6" />}
      title="Could not load products"
      description="Something went wrong on our side. Please try again."
      action={action}
      secondaryAction={
        <Button asChild variant="ghost">
          <Link href="/">Back to home</Link>
        </Button>
      }
    />
  );
}
