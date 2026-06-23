'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

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
import { authApi } from '@/lib/api/auth';
import { getErrorMessageKey } from '@/lib/auth/error';
import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from '@/lib/auth/schemas';

export function ResetPasswordForm() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token'), [searchParams]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      new_password: '',
      confirm_password: '',
    },
  });

  async function onSubmit(values: ResetPasswordSchema) {
    if (!token) {
      toast.error(t('auth.resetPassword.invalidToken'));
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.resetPassword({
        token,
        new_password: values.new_password,
      });
      router.push(`/${locale}/login?reset=true`);
    } catch (error) {
      toast.error(t(getErrorMessageKey(error)));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="mx-auto w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-semibold">
          {t('auth.resetPassword.title')}
        </h1>
        <p className="text-sm text-destructive">
          {t('auth.resetPassword.invalidToken')}
        </p>
        <a
          className="text-sm text-primary hover:underline"
          href={`/${locale}/forgot-password`}
        >
          {t('auth.resetPassword.backToForgot')}
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold">
          {t('auth.resetPassword.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('auth.resetPassword.subtitle')}
        </p>
      </div>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="new_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.resetPassword.newPassword')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="new-password"
                    type="password"
                  />
                </FormControl>
                <FormMessage>
                  {form.formState.errors.new_password?.message
                    ? t(form.formState.errors.new_password.message)
                    : null}
                </FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirm_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.resetPassword.confirmPassword')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="new-password"
                    type="password"
                  />
                </FormControl>
                <FormMessage>
                  {form.formState.errors.confirm_password?.message
                    ? t(form.formState.errors.confirm_password.message)
                    : null}
                </FormMessage>
              </FormItem>
            )}
          />
          <Button
            className="w-full"
            disabled={isSubmitting || !form.formState.isValid}
            type="submit"
          >
            {isSubmitting
              ? t('common.loading')
              : t('auth.resetPassword.submit')}
          </Button>
        </form>
      </Form>
    </div>
  );
}
