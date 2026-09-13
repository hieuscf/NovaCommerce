import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { ErrorState } from '@novacommerce/ui/components/error-state';

export interface ApiErrorStateProps {
  title?: string;
  description?: string;
  retryHref?: string;
}

export function ApiErrorState({
  title = 'We could not load this page',
  description = 'Please try again. If the problem continues, come back later.',
  retryHref,
}: ApiErrorStateProps) {
  return (
    <ErrorState
      icon={<AlertTriangle className="size-6" />}
      title={title}
      description={description}
      action={
        retryHref ? (
          <Button asChild>
            <Link href={retryHref}>Try again</Link>
          </Button>
        ) : null
      }
    />
  );
}
