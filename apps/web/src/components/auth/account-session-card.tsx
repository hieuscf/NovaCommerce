'use client';

import { useRouter } from 'next/navigation';
import { LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Card, CardContent, CardHeader } from '@novacommerce/ui/components/card';
import { Container } from '@novacommerce/ui/components/container';
import { useSession } from '@/features/auth/use-session';

export function AccountSessionCard() {
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
    <Container className="py-12 lg:py-16">
      <Card className="mx-auto max-w-lg rounded-3xl border-border/80 shadow-lg">
        <CardHeader className="space-y-3 p-7 pb-0">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-primary">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Your account</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            You are signed in. Profile, orders, and addresses will appear here as those APIs become
            available.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 p-7">
          <p className="text-sm text-muted-foreground">
            Session status: <span className="font-medium text-foreground">{status}</span>
          </p>
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            loading={isSigningOut}
            loadingLabel="Signing out"
            onClick={() => {
              void handleSignOut();
            }}
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
