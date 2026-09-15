import type { ReactNode } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { ErrorState } from '@novacommerce/ui/components/error-state';

/** Checkout load failure. Distinct from an empty cart (`CheckoutEmptyState`). */
export function CheckoutErrorState({ action }: { action: ReactNode }) {
  return (
    <ErrorState
      icon={<AlertTriangle className="size-6" />}
      title="Could not load checkout"
      description="Something went wrong on our side. Please try again."
      action={action}
      secondaryAction={
        <Button asChild variant="ghost">
          <Link href="/cart">Back to cart</Link>
        </Button>
      }
    />
  );
}
