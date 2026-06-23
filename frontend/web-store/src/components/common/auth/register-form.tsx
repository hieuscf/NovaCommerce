'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
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
import { getErrorMessageKey } from '@/lib/auth/error';
import { registerSchema, type RegisterSchema } from '@/lib/auth/schemas';

export function RegisterForm() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirm_password: '',
      full_name: '',
      phone: '',
    },
  });

  async function onSubmit(values: RegisterSchema) {
    setIsSubmitting(true);
    try {
      await authApi.register(values);
      router.push(`/${locale}/login?registered=true`);
    } catch (error) {
      toast.error(t(getErrorMessageKey(error)));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold">{t('auth.register.title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('auth.register.subtitle')}
        </p>
      </div>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.register.username')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage>
                  {form.formState.errors.username?.message
                    ? t(form.formState.errors.username.message)
                    : null}
                </FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.register.email')}</FormLabel>
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
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.register.fullName')}</FormLabel>
                <FormControl>
                  <Input {...field} autoComplete="name" />
                </FormControl>
                <FormMessage>
                  {form.formState.errors.full_name?.message
                    ? t(form.formState.errors.full_name.message)
                    : null}
                </FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.register.phone')}</FormLabel>
                <FormControl>
                  <Input {...field} autoComplete="tel" />
                </FormControl>
                <FormMessage>
                  {form.formState.errors.phone?.message
                    ? t(form.formState.errors.phone.message)
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
                <FormLabel>{t('auth.register.password')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="new-password"
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
          <FormField
            control={form.control}
            name="confirm_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.register.confirmPassword')}</FormLabel>
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
            {isSubmitting ? t('common.loading') : t('auth.register.submit')}
          </Button>
        </form>
      </Form>
      <p className="text-center text-sm">
        <a className="text-primary hover:underline" href={`/${locale}/login`}>
          {t('auth.register.haveAccount')}
        </a>
      </p>
    </div>
  );
}
