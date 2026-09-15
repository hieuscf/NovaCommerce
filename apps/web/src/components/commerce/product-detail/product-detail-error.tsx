import type { ReactNode } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { ErrorState } from '@novacommerce/ui/components/error-state';

/**
 * PDP load failure. Distinct from an unknown slug (`not-found.tsx`).
 */
export function ProductDetailErrorState({ action }: { action: ReactNode }) {
  return (
    <ErrorState
      icon={<AlertTriangle className="size-6" />}
      title="Could not load this product"
      description="Please try again. If the problem continues, come back later."
      action={action}
      secondaryAction={
        <Button asChild variant="ghost">
          <Link href="/shop">Back to shop</Link>
        </Button>
      }
    />
  );
}
