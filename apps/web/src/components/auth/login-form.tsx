'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Checkbox } from '@novacommerce/ui/components/checkbox';
import { Input } from '@novacommerce/ui/components/input';
import { Label } from '@novacommerce/ui/components/label';
import { toAuthFormError } from '@/lib/auth/errors';
import { buildRegisterHref, getSafeAuthReturnUrl } from '@/lib/auth/return-url';
import { authClient } from '@/lib/auth/client';
import { signIn } from '@/lib/auth/session';
import type { AuthErrorKind } from '@/lib/auth/types';
import { loginSchema, type LoginFormData } from '@/lib/validation/auth-schemas';
import { AuthDivider } from './auth-divider';
import { AuthError } from './auth-error';
import { AuthSocialButton } from './auth-social-button';
import { AuthSuccessMessage } from './auth-success';
import { PasswordInput } from './password-input';
import { SessionExpiredState } from './session-expired';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = getSafeAuthReturnUrl(searchParams);
  const registered = searchParams.get('registered') === 'true';
  const reason = searchParams.get('reason');

  const [error, setError] = useState<{ kind: AuthErrorKind; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  async function onSubmit(data: LoginFormData) {
    setError(null);
    setIsLoading(true);

    try {
      const result = await authClient.login({
        email: data.email,
        password: data.password,
      });

      // rememberMe is collected for a future cookie session duration.
      // Tokens stay in memory only — they are never written to storage.
      void data.rememberMe;
      signIn(result);
      setSignedIn(true);
      router.push(returnUrl);
    } catch (err) {
      setError(toAuthFormError(err));
      setIsLoading(false);
    }
  }

  return (
    <>
      <h2 className="text-[30px] font-extrabold tracking-tight text-slate-900">Sign In</h2>
      <p className="mt-3 max-w-[300px] text-[13.5px] leading-relaxed text-slate-500">
        Welcome back! Please enter your details to access your account.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-7 flex flex-col gap-5">
        {reason === 'session-expired' ? <SessionExpiredState returnUrl={returnUrl} /> : null}

        {registered ? (
          <AuthSuccessMessage
            title="Account created"
            message="Your account is ready. Please sign in to continue."
          />
        ) : null}

        {signedIn ? (
          <AuthSuccessMessage title="Signed in" message="Taking you to your destination." />
        ) : null}

        {error ? <AuthError kind={error.kind} message={error.message} /> : null}

        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-[13px] font-semibold text-slate-800">
            Email Address
          </Label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="Enter your email address"
              className="h-12 rounded-xl border-slate-200 pl-10 text-[13.5px] placeholder:text-slate-400 focus-visible:border-indigo-400"
              aria-invalid={errors.email ? 'true' : undefined}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />
          </div>
          {errors.email ? (
            <p id="email-error" className="text-xs text-destructive">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <PasswordInput
          label="Password"
          id="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password?.message}
          leading={
            <Lock
              className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
          }
          {...register('password')}
        />

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <Controller
            control={control}
            name="rememberMe"
            render={({ field }) => (
              <div className="flex items-center gap-2.5">
                <Checkbox
                  id="rememberMe"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  className="size-5 rounded-md border-slate-300"
                />
                <Label htmlFor="rememberMe" className="text-[13px] font-normal text-slate-600">
                  Remember me
                </Label>
              </div>
            )}
          />
          <Link
            href="/forgot-password"
            className="shrink-0 text-[13px] font-medium text-primary-soft hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="ghost"
          className="h-[52px] w-full rounded-xl text-[15px] font-semibold text-white hover:bg-transparent hover:text-white hover:opacity-90"
          style={{
            backgroundImage: 'linear-gradient(95deg, #4f46e5 0%, #8b5cf6 100%)',
            boxShadow: '0 16px 30px -16px rgba(79,70,229,0.8)',
          }}
          loading={isLoading}
          loadingLabel="Signing in"
        >
          Sign In
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </form>

      <div className="my-7">
        <AuthDivider label="or" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AuthSocialButton
          provider="google"
          disabled
          className="h-12 rounded-xl border-slate-200 text-[13px] font-medium text-slate-800"
        />
        <AuthSocialButton
          provider="apple"
          disabled
          className="h-12 rounded-xl border-slate-200 text-[13px] font-medium text-slate-800"
        />
      </div>

      <p className="mt-8 text-center text-[13px] text-slate-500">
        Don&apos;t have an account?{' '}
        <Link href={buildRegisterHref(returnUrl)} className="font-medium text-primary-soft hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
