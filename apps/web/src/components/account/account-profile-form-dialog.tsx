'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@novacommerce/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@novacommerce/ui/components/dialog';
import { Input } from '@novacommerce/ui/components/input';
import { Label } from '@novacommerce/ui/components/label';
import { toast } from '@novacommerce/ui/components/toast';
import { useAccount } from '@/features/account/account-context';
import { toFormError } from '@/lib/errors';
import {
  updateProfileSchema,
  type UpdateProfileFormData,
} from '@/lib/validation/account-schemas';

export function AccountProfileFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { profile, updateProfile } = useAccount();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      displayName: profile?.name ?? '',
      phoneNumber: profile?.phoneNumber ?? '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        displayName: profile?.name ?? '',
        phoneNumber: profile?.phoneNumber ?? '',
      });
      setFormError(null);
    }
  }, [open, profile, reset]);

  async function onSubmit(data: UpdateProfileFormData) {
    setFormError(null);
    try {
      await updateProfile({
        displayName: data.displayName.trim(),
        phoneNumber: data.phoneNumber?.trim() ? data.phoneNumber.trim() : null,
      });
      toast.success('Profile updated');
      onOpenChange(false);
    } catch (error) {
      setFormError(toFormError(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Update how your name and phone appear on your account.</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input id="displayName" autoComplete="name" {...register('displayName')} />
            {errors.displayName ? (
              <p className="text-xs text-destructive">{errors.displayName.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phoneNumber">Phone number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              autoComplete="tel"
              placeholder="+84901234567"
              {...register('phoneNumber')}
            />
            {errors.phoneNumber ? (
              <p className="text-xs text-destructive">{errors.phoneNumber.message}</p>
            ) : null}
          </div>
          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} loadingLabel="Saving">
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
