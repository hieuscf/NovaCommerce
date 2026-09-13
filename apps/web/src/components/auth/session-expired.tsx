import Link from 'next/link';
import { Clock } from 'lucide-react';
import {
  Alert,
  AlertActions,
  AlertContent,
  AlertDescription,
  AlertTitle,
} from '@novacommerce/ui/components/alert';
import { Button } from '@novacommerce/ui/components/button';
import { buildLoginHref } from '@/lib/auth/return-url';

export interface SessionExpiredStateProps {
  returnUrl?: string;
}

export function SessionExpiredState({ returnUrl }: SessionExpiredStateProps) {
  return (
    <Alert variant="warning" aria-live="assertive">
      <Clock aria-hidden="true" />
      <AlertContent>
        <AlertTitle>Your session has expired</AlertTitle>
        <AlertDescription>
          <p>Please sign in again to continue.</p>
        </AlertDescription>
        <AlertActions>
          <Button asChild size="sm">
            <Link href={buildLoginHref(returnUrl, 'session-expired')}>Sign in</Link>
          </Button>
        </AlertActions>
      </AlertContent>
    </Alert>
  );
}
