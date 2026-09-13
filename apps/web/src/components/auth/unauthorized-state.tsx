'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldOff } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { ErrorState } from '@novacommerce/ui/components/error-state';

export function UnauthorizedState() {
  const router = useRouter();

  return (
    <ErrorState
      tone="neutral"
      icon={<ShieldOff className="size-6" />}
      title="Access restricted"
      description="You don't have permission to view this page."
      action={
        <Button asChild variant="primary-gradient">
          <Link href="/">Go to Home</Link>
        </Button>
      }
      secondaryAction={
        <>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Back
          </Button>
          <Button asChild variant="ghost">
            <Link href="/account">Go to Account</Link>
          </Button>
        </>
      }
    />
  );
}
