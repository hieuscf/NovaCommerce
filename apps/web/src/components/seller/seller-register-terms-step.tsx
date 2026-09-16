'use client';

import Link from 'next/link';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Checkbox } from '@novacommerce/ui/components/checkbox';
import { Label } from '@novacommerce/ui/components/label';
import type { SellerRegisterFormValues } from '@/lib/validation/seller-schemas';
import type { SellerPageViewModel, SellerTermsSectionViewModel } from '@/lib/view-models/seller';

function TermsSection({ section }: { section: SellerTermsSectionViewModel }) {
  return (
    <section className="space-y-2.5">
      <h3 className="text-[15px] font-bold text-ink">
        {section.number}. {section.title}
      </h3>
      <div className="space-y-2">
        {section.clauses.map((clause) => (
          <div key={clause.id} className="text-[13.5px] leading-relaxed text-copy">
            <p>
              <span className="font-semibold text-ink">{clause.id}.</span>{' '}
              <span className="font-semibold text-ink">{clause.label}:</span>
              {clause.text ? ` ${clause.text}` : null}
            </p>
            {clause.bullets && clause.bullets.length > 0 ? (
              <ul className="mt-1.5 ml-6 list-disc space-y-1 marker:text-primary/70">
                {clause.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function SellerRegisterTermsStep({
  form,
  page,
  onBack,
  onSubmit,
}: {
  form: UseFormReturn<SellerRegisterFormValues>;
  page: SellerPageViewModel;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const errors = form.formState.errors;

  function setAgreement(accepted: boolean) {
    form.setValue('acceptTerms', accepted, { shouldDirty: true, shouldValidate: true });
    form.setValue('acceptSellerAgreement', accepted, { shouldDirty: true, shouldValidate: true });
    form.setValue('acceptPrivacy', accepted, { shouldDirty: true, shouldValidate: true });
  }

  const accepted =
    form.watch('acceptTerms') &&
    form.watch('acceptSellerAgreement') &&
    form.watch('acceptPrivacy');
  const agreementError =
    errors.acceptTerms?.message ??
    errors.acceptSellerAgreement?.message ??
    errors.acceptPrivacy?.message;

  return (
    <form
      className="mt-7 space-y-6"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="max-h-[16.75rem] overflow-hidden rounded-2xl border border-primary/12 bg-primary/5 sm:max-h-[22rem]">
        <article
          aria-label="Seller terms and conditions"
          className="max-h-[16.75rem] space-y-5 overflow-y-auto px-5 py-5 sm:max-h-[22rem] sm:px-6"
        >
          {page.termsSections.map((section) => (
            <TermsSection key={section.number} section={section} />
          ))}
        </article>
      </div>

      <Controller
        control={form.control}
        name="acceptTerms"
        render={({ field }) => (
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="seller-acceptTerms"
                checked={accepted}
                onCheckedChange={(checked) => {
                  const next = checked === true;
                  field.onChange(next);
                  setAgreement(next);
                }}
                onBlur={field.onBlur}
                ref={field.ref}
                className="mt-0.5 rounded-md"
                aria-invalid={agreementError ? true : undefined}
                aria-describedby={agreementError ? 'seller-acceptTerms-error' : undefined}
              />
              <Label
                htmlFor="seller-acceptTerms"
                className="block text-[14px] font-medium leading-relaxed text-primary"
              >
                I have read and agree to the{' '}
                <Link href="/terms" className="inline font-semibold text-primary hover:text-primary-strong">
                  Terms and Conditions
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="inline font-semibold text-primary hover:text-primary-strong">
                  Privacy Policy
                </Link>
              </Label>
            </div>
            {agreementError ? (
              <p id="seller-acceptTerms-error" className="text-caption font-medium text-destructive">
                {agreementError}
              </p>
            ) : null}
          </div>
        )}
      />

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
          Complete Registration
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}
