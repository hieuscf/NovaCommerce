'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { authClient } from '@/lib/auth/client';
import { toAuthFormError } from '@/lib/auth/errors';
import type { AuthErrorKind } from '@/lib/auth/types';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validation/auth-schemas';
import { AuthCard } from './auth-card';
import { AuthError } from './auth-error';
import { AuthSuccessMessage } from './auth-success';
import { PasswordInput } from './password-input';
import { PasswordStrength } from './password-strength';

export interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<{ kind: AuthErrorKind; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const newPassword = watch('newPassword');

  async function onSubmit(data: ResetPasswordFormData) {
    setError(null);
    setIsLoading(true);

    try {
      await authClient.resetPassword({ token: data.token, newPassword: data.newPassword });
      setSubmitted(true);
    } catch (err) {
      setError(toAuthFormError(err));
      setIsLoading(false);
    }
  }

  if (submitted) {
    return (
      <AuthCard
        title="Password updated"
        description="Your password has been reset successfully."
        footer={
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in with your new password
            </Link>
          </p>
        }
      >
        <AuthSuccessMessage title="All set" message="You can now sign in with your new password." />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset password"
      description="Create a new secure password for your account."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {error ? <AuthError kind={error.kind} message={error.message} /> : null}

        <input type="hidden" {...register('token')} />

        <PasswordInput
          label="New password"
          id="newPassword"
          placeholder="Create a new password"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <PasswordStrength password={newPassword ?? ''} />

        <PasswordInput
          label="Confirm new password"
          id="confirmPassword"
          placeholder="Confirm your new password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" className="w-full" size="lg" loading={isLoading}>
          Reset password
          <ArrowRight className="size-4" />
        </Button>
      </form>
    </AuthCard>
  );
}
