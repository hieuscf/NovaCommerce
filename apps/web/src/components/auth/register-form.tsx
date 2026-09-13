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
import { authClient } from '@/lib/auth/client';
import { toAuthFormError } from '@/lib/auth/errors';
import { buildLoginHref, getSafeAuthReturnUrl } from '@/lib/auth/return-url';
import type { AuthErrorKind } from '@/lib/auth/types';
import { registerSchema, type RegisterFormData } from '@/lib/validation/auth-schemas';
import { AuthDivider } from './auth-divider';
import { AuthError } from './auth-error';
import { AuthSocialButton } from './auth-social-button';
import { PasswordInput } from './password-input';
import { PasswordRequirements } from './password-requirements';
import { PasswordStrength } from './password-strength';

const fieldInputClass =
  'h-12 rounded-xl border-slate-200 text-[13.5px] placeholder:text-slate-400 focus-visible:border-indigo-400';

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = getSafeAuthReturnUrl(searchParams);

  const [error, setError] = useState<{ kind: AuthErrorKind; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      marketingConsent: false,
      termsAccepted: false,
    },
  });

  const password = watch('password');

  async function onSubmit(data: RegisterFormData) {
    setError(null);
    setIsLoading(true);

    try {
      // Current Identity backend accepts email + password only.
      // First/last name, terms, and marketing consent are collected in the UI
      // and will be wired to the user profile once the backend supports them.
      await authClient.register({
        email: data.email,
        password: data.password,
      });

      const next = buildLoginHref(returnUrl);
      const separator = next.includes('?') ? '&' : '?';
      router.push(`${next}${separator}registered=true`);
    } catch (err) {
      setError(toAuthFormError(err));
      setIsLoading(false);
    }
  }

  return (
    <>
      <h2 className="text-[30px] font-extrabold tracking-tight text-slate-900">Create Account</h2>
      <p className="mt-3 max-w-[340px] text-[13.5px] leading-relaxed text-slate-500">
        Please enter your details to create your account and start shopping.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-7 flex flex-col gap-5">
        {error ? <AuthError kind={error.kind} message={error.message} /> : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="firstName" className="text-[13px] font-semibold text-slate-800">
              First name
            </Label>
            <Input
              id="firstName"
              autoComplete="given-name"
              placeholder="Jane"
              className={fieldInputClass}
              aria-invalid={errors.firstName ? 'true' : undefined}
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              {...register('firstName')}
            />
            {errors.firstName ? (
              <p id="firstName-error" className="text-xs text-destructive">
                {errors.firstName.message}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lastName" className="text-[13px] font-semibold text-slate-800">
              Last name
            </Label>
            <Input
              id="lastName"
              autoComplete="family-name"
              placeholder="Doe"
              className={fieldInputClass}
              aria-invalid={errors.lastName ? 'true' : undefined}
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              {...register('lastName')}
            />
            {errors.lastName ? (
              <p id="lastName-error" className="text-xs text-destructive">
                {errors.lastName.message}
              </p>
            ) : null}
          </div>
        </div>

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
              className={`${fieldInputClass} pl-10`}
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
          placeholder="Create a password"
          autoComplete="new-password"
          error={errors.password?.message}
          leading={
            <Lock
              className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
          }
          {...register('password')}
        />
        <PasswordRequirements password={password ?? ''} />
        <PasswordStrength password={password ?? ''} />

        <PasswordInput
          label="Confirm password"
          id="confirmPassword"
          placeholder="Confirm your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          leading={
            <Lock
              className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
          }
          {...register('confirmPassword')}
        />

        <div className="flex flex-col gap-3">
          <Controller
            control={control}
            name="termsAccepted"
            render={({ field }) => (
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="termsAccepted"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  className="mt-0.5 size-5 rounded-md border-slate-300"
                  aria-invalid={errors.termsAccepted ? 'true' : undefined}
                />
                <Label
                  htmlFor="termsAccepted"
                  className="text-[13px] font-normal leading-relaxed text-slate-600"
                >
                  I agree to the{' '}
                  <Link href="/terms" className="font-medium text-primary-soft hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="font-medium text-primary-soft hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </Label>
              </div>
            )}
          />
          {errors.termsAccepted ? (
            <p className="text-xs text-destructive">{errors.termsAccepted.message}</p>
          ) : null}

          <Controller
            control={control}
            name="marketingConsent"
            render={({ field }) => (
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="marketingConsent"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  className="mt-0.5 size-5 rounded-md border-slate-300"
                />
                <Label
                  htmlFor="marketingConsent"
                  className="text-[13px] font-normal leading-relaxed text-slate-500"
                >
                  Send me marketing updates and promotional offers (optional).
                </Label>
              </div>
            )}
          />
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
          loadingLabel="Creating account"
        >
          Create Account
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
        Already have an account?{' '}
        <Link href={buildLoginHref(returnUrl)} className="font-medium text-primary-soft hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
