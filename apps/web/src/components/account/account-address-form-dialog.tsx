'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@novacommerce/ui/components/button';
import { Checkbox } from '@novacommerce/ui/components/checkbox';
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
import type { AccountAddressViewModel } from '@/lib/view-models/account';
import { addressFormSchema, type AddressFormData } from '@/lib/validation/account-schemas';

export function AccountAddressFormDialog({
  open,
  onOpenChange,
  address,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: AccountAddressViewModel | null;
}) {
  const { addAddress, updateAddress } = useAccount();
  const [formError, setFormError] = useState<string | null>(null);
  const editing = Boolean(address);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      label: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'VN',
      isDefault: false,
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    reset(
      address
        ? {
            label: address.label,
            line1: address.line1,
            line2: address.line2 ?? '',
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            isDefault: address.isDefault,
          }
        : {
            label: '',
            line1: '',
            line2: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'VN',
            isDefault: false,
          },
    );
    setFormError(null);
  }, [open, address, reset]);

  async function onSubmit(data: AddressFormData) {
    setFormError(null);
    const payload = {
      label: data.label.trim(),
      line1: data.line1.trim(),
      line2: data.line2?.trim() || undefined,
      city: data.city.trim(),
      state: data.state.trim(),
      postalCode: data.postalCode.trim(),
      country: data.country,
      isDefault: data.isDefault,
    };

    try {
      if (address) {
        await updateAddress(address.id, payload);
        toast.success('Address updated');
      } else {
        await addAddress(payload);
        toast.success('Address added');
      }
      onOpenChange(false);
    } catch (error) {
      setFormError(toFormError(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit address' : 'Add address'}</DialogTitle>
          <DialogDescription>
            Shipping addresses are saved to your NovaCommerce account.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="label">Label</Label>
            <Input id="label" placeholder="Home" {...register('label')} />
            {errors.label ? <p className="text-xs text-destructive">{errors.label.message}</p> : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="line1">Address line 1</Label>
            <Input id="line1" autoComplete="address-line1" {...register('line1')} />
            {errors.line1 ? <p className="text-xs text-destructive">{errors.line1.message}</p> : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="line2">Address line 2</Label>
            <Input id="line2" autoComplete="address-line2" {...register('line2')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" autoComplete="address-level2" {...register('city')} />
              {errors.city ? <p className="text-xs text-destructive">{errors.city.message}</p> : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="state">State / province</Label>
              <Input id="state" autoComplete="address-level1" {...register('state')} />
              {errors.state ? <p className="text-xs text-destructive">{errors.state.message}</p> : null}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="postalCode">Postal code</Label>
              <Input id="postalCode" autoComplete="postal-code" {...register('postalCode')} />
              {errors.postalCode ? (
                <p className="text-xs text-destructive">{errors.postalCode.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" autoComplete="country" maxLength={2} {...register('country')} />
              {errors.country ? (
                <p className="text-xs text-destructive">{errors.country.message}</p>
              ) : null}
            </div>
          </div>
          <Controller
            name="isDefault"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={Boolean(field.value)}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
                Set as default address
              </label>
            )}
          />
          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} loadingLabel="Saving">
              {editing ? 'Save address' : 'Add address'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
