'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Mail } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Input } from '@novacommerce/ui/components/input';
import { Label } from '@novacommerce/ui/components/label';
import { authClient } from '@/lib/auth/client';
import { toAuthFormError } from '@/lib/auth/errors';
import type { AuthErrorKind } from '@/lib/auth/types';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validation/auth-schemas';
import { AuthCard } from './auth-card';
import { AuthError } from './auth-error';
import { AuthSuccessMessage } from './auth-success';

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<{ kind: AuthErrorKind; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setError(null);
    setIsLoading(true);

    try {
      await authClient.forgotPassword({ email: data.email });
      setSubmitted(true);
    } catch (err) {
      setError(toAuthFormError(err));
      setIsLoading(false);
    }
  }

  if (submitted) {
    return (
      <AuthCard
        title="Check your email"
        description="If an account exists for this email, we'll send password reset instructions."
        footer={
          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        }
      >
        <AuthSuccessMessage
          title="Reset link sent"
          message="Please check your inbox and follow the instructions. The link expires shortly for security."
        />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter your email and we'll help you get back in."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {error ? <AuthError kind={error.kind} message={error.message} /> : null}

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              className="h-12 pl-10"
              aria-invalid={errors.email ? 'true' : undefined}
              {...register('email')}
            />
          </div>
          {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
        </div>

        <Button type="submit" className="w-full" size="lg" loading={isLoading}>
          Send reset link
          <ArrowRight className="size-4" />
        </Button>
      </form>
    </AuthCard>
  );
}
