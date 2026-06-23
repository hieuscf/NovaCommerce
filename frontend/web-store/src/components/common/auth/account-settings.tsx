'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { changePasswordSchema, updateProfileSchema } from '@/lib/auth/schemas';
import type { AuthUser } from '@/types/auth';

type ProfileFormValues = {
  full_name: string;
  phone: string;
};

type ChangePasswordValues = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

type AccountSettingsProps = {
  user: AuthUser;
};

export function AccountSettings({ user }: AccountSettingsProps) {
  const t = useTranslations();
  const [previewUrl, setPreviewUrl] = useState<string>(user.avatar_url || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    mode: 'onChange',
    defaultValues: {
      full_name: user.full_name ?? '',
      phone: user.phone ?? '',
    },
  });

  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  async function handleProfileSubmit(values: ProfileFormValues) {
    setIsSavingProfile(true);
    try {
      await authApi.updateProfile({
        ...values,
        avatar_url: previewUrl || undefined,
      });
      toast.success(t('auth.account.profileSaved'));
    } catch (error) {
      toast.error(t(getErrorMessageKey(error)));
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(values: ChangePasswordValues) {
    setIsChangingPassword(true);
    try {
      await authApi.changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
      });
      toast.success(t('auth.account.passwordSaved'));
      passwordForm.reset();
    } catch (error) {
      toast.error(t(getErrorMessageKey(error)));
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleAvatarUpload(file: File) {
    const nextPreview = URL.createObjectURL(file);
    setPreviewUrl(nextPreview);
    setIsUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/account/avatar', {
        method: 'POST',
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message ?? 'Upload failed');
      }

      setPreviewUrl(payload.data.url);
      toast.success(t('auth.account.avatarSaved'));
    } catch {
      toast.error(t('auth.account.avatarFailed'));
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('auth.account.profileTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form
              className="space-y-4"
              onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
            >
              <FormField
                control={profileForm.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.register.fullName')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage>
                      {profileForm.formState.errors.full_name?.message
                        ? t(profileForm.formState.errors.full_name.message)
                        : null}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.register.phone')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage>
                      {profileForm.formState.errors.phone?.message
                        ? t(profileForm.formState.errors.phone.message)
                        : null}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <Button
                disabled={isSavingProfile || !profileForm.formState.isValid}
                type="submit"
              >
                {isSavingProfile
                  ? t('common.loading')
                  : t('auth.account.saveProfile')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('auth.account.passwordTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form
              className="space-y-4"
              onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
            >
              <FormField
                control={passwordForm.control}
                name="current_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.account.currentPassword')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage>
                      {passwordForm.formState.errors.current_password?.message
                        ? t(
                            passwordForm.formState.errors.current_password
                              .message,
                          )
                        : null}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="new_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.account.newPassword')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage>
                      {passwordForm.formState.errors.new_password?.message
                        ? t(passwordForm.formState.errors.new_password.message)
                        : null}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.account.confirmPassword')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage>
                      {passwordForm.formState.errors.confirm_password?.message
                        ? t(
                            passwordForm.formState.errors.confirm_password
                              .message,
                          )
                        : null}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <Button
                disabled={isChangingPassword || !passwordForm.formState.isValid}
                type="submit"
              >
                {isChangingPassword
                  ? t('common.loading')
                  : t('auth.account.savePassword')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('auth.account.avatarTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt="avatar preview"
              className="size-24 rounded-full object-cover"
              src={previewUrl}
            />
          ) : null}
          <Input
            accept="image/*"
            disabled={isUploadingAvatar}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) {
                return;
              }
              void handleAvatarUpload(file);
            }}
            type="file"
          />
        </CardContent>
      </Card>
    </div>
  );
}
