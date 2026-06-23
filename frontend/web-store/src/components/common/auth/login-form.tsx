'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { authApi } from '@/lib/api/auth';
import { getErrorMessageKey } from '@/lib/auth/error';
import { type LoginSchema, loginSchema } from '@/lib/auth/schemas';
import { useAuthStore } from '@/lib/store/auth-store';
import { getSafeRedirectPath } from '@/lib/utils/url';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';

type LoginFormProps = {
  redirectPath?: string | null;
  oauthError?: string | null;
  registered?: string | null;
  reset?: string | null;
};

export function LoginForm({
  redirectPath,
  oauthError,
  registered,
  reset,
}: LoginFormProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  async function onSubmit(values: LoginSchema) {
    setIsSubmitting(true);
    try {
      const user = await authApi.login(values);
      setAuth(user);
      const safeRedirect = getSafeRedirectPath(redirectPath, `/${locale}`);
      router.push(safeRedirect);
    } catch (error) {
      toast.error(t(getErrorMessageKey(error)));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold">{t('auth.login.title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('auth.login.subtitle')}
        </p>
        {oauthError ? (
          <p className="text-sm text-destructive">
            {t('auth.login.oauthError')}
          </p>
        ) : null}
        {registered === 'true' ? (
          <p className="text-sm text-emerald-600">
            {t('auth.login.registeredSuccess')}
          </p>
        ) : null}
        {reset === 'true' ? (
          <p className="text-sm text-emerald-600">
            {t('auth.login.resetSuccess')}
          </p>
        ) : null}
      </div>

      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.login.identifier')}</FormLabel>
                <FormControl>
                  <Input {...field} autoComplete="username" />
                </FormControl>
                <FormMessage>
                  {form.formState.errors.identifier?.message
                    ? t(form.formState.errors.identifier.message)
                    : null}
                </FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.login.password')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="current-password"
                    type="password"
                  />
                </FormControl>
                <FormMessage>
                  {form.formState.errors.password?.message
                    ? t(form.formState.errors.password.message)
                    : null}
                </FormMessage>
              </FormItem>
            )}
          />
          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? t('common.loading') : t('auth.login.submit')}
          </Button>
        </form>
      </Form>

      <div className="space-y-2">
        <Button
          className="w-full"
          onClick={() => {
            window.location.href = `/api/auth/oauth/google?redirect=${encodeURIComponent(redirectPath ?? `/${locale}`)}`;
          }}
          type="button"
          variant="outline"
        >
          {t('auth.login.google')}
        </Button>
        <Button
          className="w-full"
          onClick={() => {
            window.location.href = `/api/auth/oauth/facebook?redirect=${encodeURIComponent(redirectPath ?? `/${locale}`)}`;
          }}
          type="button"
          variant="outline"
        >
          {t('auth.login.facebook')}
        </Button>
      </div>

      <div className="flex justify-between text-sm">
        <a
          className="text-primary hover:underline"
          href={`/${locale}/forgot-password`}
        >
          {t('auth.login.forgotPassword')}
        </a>
        <a
          className="text-primary hover:underline"
          href={`/${locale}/register`}
        >
          {t('auth.login.noAccount')}
        </a>
      </div>
    </div>
  );
}
