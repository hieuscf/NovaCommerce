'use client';

import { useRouter } from 'next/navigation';
import { LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { useSession } from '@/features/auth/use-session';
import { AccountCard } from './account-card';

export function AccountSecurityPanel() {
  const router = useRouter();
  const { status, isSigningOut, signOut } = useSession();

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }
    await signOut();
    router.push('/');
  }

  return (
    <AccountCard>
      <div className="flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-primary">
        <ShieldCheck className="size-6" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-lg font-bold text-foreground">Account security</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        You are signed in. Password reset remains available from the login flow.
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        Session status: <span className="font-medium text-foreground">{status}</span>
      </p>
      <Button
        type="button"
        variant="secondary"
        className="mt-6 w-full sm:w-auto"
        loading={isSigningOut}
        loadingLabel="Signing out"
        onClick={() => {
          void handleSignOut();
        }}
      >
        <LogOut className="size-4" aria-hidden="true" />
        Sign out
      </Button>
    </AccountCard>
  );
}
