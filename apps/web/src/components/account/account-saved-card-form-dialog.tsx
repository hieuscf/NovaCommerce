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
import { formatCardExpiration, formatCardNumber, parseCardExpiration } from '@/lib/checkout/card-input';
import { toFormError } from '@/lib/errors';
import { paymentMethodsClient } from '@/lib/payment/client';
import { savedCardFormSchema, type SavedCardFormData } from '@/lib/validation/account-schemas';

export function AccountSavedCardFormDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => Promise<void> | void;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SavedCardFormData>({
    resolver: zodResolver(savedCardFormSchema),
    defaultValues: {
      cardNumber: '',
      cardholderName: '',
      cardExpiration: '',
      isDefault: false,
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    reset({
      cardNumber: '',
      cardholderName: '',
      cardExpiration: '',
      isDefault: false,
    });
    setFormError(null);
  }, [open, reset]);

  async function onSubmit(data: SavedCardFormData) {
    setFormError(null);
    const expiration = parseCardExpiration(data.cardExpiration);
    if (!expiration) {
      setFormError('Enter a valid expiration date');
      return;
    }

    try {
      // CVV is intentionally omitted — never send or store (ADR-006).
      await paymentMethodsClient.add({
        cardNumber: data.cardNumber.replace(/\D/g, ''),
        cardholderName: data.cardholderName.trim(),
        expMonth: expiration.month,
        expYear: expiration.year,
        isDefault: data.isDefault,
      });
      toast.success('Card saved', {
        description: 'You will enter CVV each time you pay with this card.',
      });
      onOpenChange(false);
      await onSaved();
    } catch (error) {
      setFormError(toFormError(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add card</DialogTitle>
          <DialogDescription>
            We store a secure token and the last four digits only. CVV is never saved — you enter it
            when you pay.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="saved-card-number">Card number</Label>
            <Controller
              control={control}
              name="cardNumber"
              render={({ field }) => (
                <Input
                  id="saved-card-number"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="•••• •••• •••• ••••"
                  value={field.value}
                  onChange={(event) => field.onChange(formatCardNumber(event.target.value))}
                  aria-invalid={Boolean(errors.cardNumber)}
                />
              )}
            />
            {errors.cardNumber ? (
              <p className="text-caption text-destructive">{errors.cardNumber.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="saved-cardholder">Cardholder name</Label>
            <Input
              id="saved-cardholder"
              autoComplete="cc-name"
              {...register('cardholderName')}
              aria-invalid={Boolean(errors.cardholderName)}
            />
            {errors.cardholderName ? (
              <p className="text-caption text-destructive">{errors.cardholderName.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="saved-card-exp">Expiration</Label>
            <Controller
              control={control}
              name="cardExpiration"
              render={({ field }) => (
                <Input
                  id="saved-card-exp"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM / YY"
                  value={field.value}
                  onChange={(event) => field.onChange(formatCardExpiration(event.target.value))}
                  aria-invalid={Boolean(errors.cardExpiration)}
                />
              )}
            />
            {errors.cardExpiration ? (
              <p className="text-caption text-destructive">{errors.cardExpiration.message}</p>
            ) : null}
          </div>
          <p className="rounded-lg bg-muted/60 px-3 py-2 text-caption text-muted-foreground">
            CVV/CVC is not collected when saving a card.
          </p>
          <Controller
            control={control}
            name="isDefault"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={field.value === true}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
                Set as default
              </label>
            )}
          />
          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
