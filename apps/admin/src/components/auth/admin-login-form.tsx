'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Input } from '@novacommerce/ui/components/input';
import { Label } from '@novacommerce/ui/components/label';
import { adminAuthClient } from '@/lib/auth/client';
import { signIn } from '@/lib/auth/session';
import { useAdminSession } from '@/features/auth/use-session';
import { toFormError } from '@/lib/errors';

export function AdminLoginForm({
  returnUrl,
  reason,
}: {
  returnUrl: string;
  reason: string | null;
}) {
  const router = useRouter();
  const session = useAdminSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !session.isAuthenticated) {
      return;
    }
    router.replace(returnUrl);
  }, [ready, returnUrl, router, session.isAuthenticated]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await adminAuthClient.login({
        email: email.trim(),
        password,
      });
      signIn(result.accessToken);
      router.replace(returnUrl);
    } catch (err) {
      setError(toFormError(err));
      setSubmitting(false);
    }
  }

  // Keep SSR and the first client paint identical (always the form).
  // Redirect UI only after mount when a session is already present.
  if (ready && session.isAuthenticated) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-sm font-semibold text-foreground">You are already signed in</p>
        <p className="text-sm text-muted-foreground">Redirecting to the admin console…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Shield className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Admin sign in</h2>
        <p className="text-sm text-muted-foreground">
          Enter your operator credentials to access the NovaCommerce console.
        </p>
      </div>

      {reason === 'session-expired' ? (
        <p
          className="rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning-strong"
          role="status"
        >
          Your session expired. Please sign in again.
        </p>
      ) : null}

      {reason === 'session-required' ? (
        <p
          className="rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
          role="status"
        >
          Sign in is required to open that page.
        </p>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="admin-login-email">Email</Label>
          <Input
            id="admin-login-email"
            type="email"
            autoComplete="username"
            inputMode="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@novacommerce.local"
            startAdornment={<Mail className="size-4 text-muted-foreground" aria-hidden="true" />}
            className="h-11"
            groupClassName="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-login-password">Password</Label>
          <Input
            id="admin-login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            startAdornment={<Lock className="size-4 text-muted-foreground" aria-hidden="true" />}
            endAdornment={
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            }
            className="h-11"
            groupClassName="rounded-xl"
          />
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={submitting}
          className="h-11 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500/90 hover:to-violet-500/90"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
}
