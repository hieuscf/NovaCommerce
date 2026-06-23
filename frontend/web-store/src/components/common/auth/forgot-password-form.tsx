'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
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
import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
} from '@/lib/auth/schemas';

export function ForgotPasswordForm() {
  const t = useTranslations();
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotPasswordSchema) {
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(values);
      toast.success(t('auth.forgotPassword.genericSuccess'));
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold">
          {t('auth.forgotPassword.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('auth.forgotPassword.subtitle')}
        </p>
      </div>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.forgotPassword.email')}</FormLabel>
                <FormControl>
                  <Input {...field} autoComplete="email" type="email" />
                </FormControl>
                <FormMessage>
                  {form.formState.errors.email?.message
                    ? t(form.formState.errors.email.message)
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
              : t('auth.forgotPassword.submit')}
          </Button>
        </form>
      </Form>
      <p className="text-center text-sm">
        <a className="text-primary hover:underline" href={`/${locale}/login`}>
          {t('auth.forgotPassword.backToLogin')}
        </a>
      </p>
    </div>
  );
}
