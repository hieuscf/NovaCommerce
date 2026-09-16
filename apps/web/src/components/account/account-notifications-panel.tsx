'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bell } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Checkbox } from '@novacommerce/ui/components/checkbox';
import { toast } from '@novacommerce/ui/components/toast';
import { useAccount } from '@/features/account/account-context';
import { toFormError } from '@/lib/errors';
import {
  notificationPreferencesSchema,
  type NotificationPreferencesFormData,
} from '@/lib/validation/account-schemas';
import { AccountCard } from './account-card';

export function AccountNotificationsPanel() {
  const { notifications, updateNotifications } = useAccount();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<NotificationPreferencesFormData>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: notifications,
  });

  useEffect(() => {
    reset(notifications);
  }, [notifications, reset]);

  async function onSubmit(data: NotificationPreferencesFormData) {
    setFormError(null);
    try {
      await updateNotifications(data);
      toast.success('Notification preferences saved');
    } catch (error) {
      setFormError(toFormError(error));
    }
  }

  return (
    <AccountCard>
      <div className="flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-primary">
        <Bell className="size-6" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-lg font-bold text-foreground">Notification preferences</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Choose how NovaCommerce should reach you about orders and account updates.
      </p>
      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        {(
          [
            ['email', 'Order updates by email'],
            ['push', 'Push notifications'],
            ['sms', 'SMS alerts'],
            ['marketingEmail', 'Marketing emails'],
          ] as const
        ).map(([name, label]) => (
          <Controller
            key={name}
            name={name}
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-3 text-sm text-foreground">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
                {label}
              </label>
            )}
          />
        ))}
        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
        <Button
          type="submit"
          className="mt-2 w-full sm:w-auto"
          loading={isSubmitting}
          loadingLabel="Saving"
          disabled={!isDirty}
        >
          Save preferences
        </Button>
      </form>
    </AccountCard>
  );
}
