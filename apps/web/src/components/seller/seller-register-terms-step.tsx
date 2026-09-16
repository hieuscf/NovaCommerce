'use client';

import Link from 'next/link';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { ArrowLeft, Shield } from 'lucide-react';
import { Alert, AlertContent, AlertDescription, AlertTitle } from '@novacommerce/ui/components/alert';
import { Button } from '@novacommerce/ui/components/button';
import { Checkbox } from '@novacommerce/ui/components/checkbox';
import { Label } from '@novacommerce/ui/components/label';
import type { SellerRegisterFormValues } from '@/lib/validation/seller-schemas';

export function SellerRegisterTermsStep({
  form,
  onBack,
  onSubmit,
}: {
  form: UseFormReturn<SellerRegisterFormValues>;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const errors = form.formState.errors;

  return (
    <form
      className="mt-7 space-y-6"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="space-y-4 rounded-2xl border border-border bg-surface/50 p-5">
        <Controller
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <div className="flex items-start gap-3">
              <Checkbox
                id="seller-acceptTerms"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                onBlur={field.onBlur}
                ref={field.ref}
                className="mt-0.5 rounded-md"
                aria-invalid={errors.acceptTerms ? true : undefined}
              />
              <Label htmlFor="seller-acceptTerms" className="text-[14px] font-normal leading-relaxed text-copy">
                I agree to the{' '}
                <Link href="/terms" className="font-semibold text-primary hover:text-primary-strong">
                  Terms of Service
                </Link>
                .
              </Label>
            </div>
          )}
        />
        {errors.acceptTerms?.message ? (
          <p className="text-caption font-medium text-destructive">{errors.acceptTerms.message}</p>
        ) : null}

        <Controller
          control={form.control}
          name="acceptSellerAgreement"
          render={({ field }) => (
            <div className="flex items-start gap-3">
              <Checkbox
                id="seller-acceptSellerAgreement"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                onBlur={field.onBlur}
                ref={field.ref}
                className="mt-0.5 rounded-md"
                aria-invalid={errors.acceptSellerAgreement ? true : undefined}
              />
              <Label
                htmlFor="seller-acceptSellerAgreement"
                className="text-[14px] font-normal leading-relaxed text-copy"
              >
                I agree to the Seller Agreement and confirm that the information I provided is accurate.
              </Label>
            </div>
          )}
        />
        {errors.acceptSellerAgreement?.message ? (
          <p className="text-caption font-medium text-destructive">{errors.acceptSellerAgreement.message}</p>
        ) : null}

        <Controller
          control={form.control}
          name="acceptPrivacy"
          render={({ field }) => (
            <div className="flex items-start gap-3">
              <Checkbox
                id="seller-acceptPrivacy"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                onBlur={field.onBlur}
                ref={field.ref}
                className="mt-0.5 rounded-md"
                aria-invalid={errors.acceptPrivacy ? true : undefined}
              />
              <Label htmlFor="seller-acceptPrivacy" className="text-[14px] font-normal leading-relaxed text-copy">
                I agree to the{' '}
                <Link href="/privacy" className="font-semibold text-primary hover:text-primary-strong">
                  Privacy Policy
                </Link>
                .
              </Label>
            </div>
          )}
        />
        {errors.acceptPrivacy?.message ? (
          <p className="text-caption font-medium text-destructive">{errors.acceptPrivacy.message}</p>
        ) : null}
      </div>

      <Alert variant="info">
        <Shield aria-hidden="true" />
        <AlertContent>
          <AlertTitle>What happens next</AlertTitle>
          <AlertDescription>
            We will email you if we need supporting documents. You can continue shopping while we
            review your application.
          </AlertDescription>
        </AlertContent>
      </Alert>

      <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          className="h-11 justify-start px-0 text-primary hover:bg-transparent hover:text-primary-strong"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </Button>
        <Button type="submit" className="h-11 rounded-full px-7">
          Submit application
        </Button>
      </div>
    </form>
  );
}
