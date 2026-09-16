'use client';

import { Controller, type UseFormReturn } from 'react-hook-form';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Factory,
  FileBadge,
  Receipt,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Store,
} from 'lucide-react';
import { Alert, AlertContent, AlertDescription, AlertTitle } from '@novacommerce/ui/components/alert';
import { Button } from '@novacommerce/ui/components/button';
import { cn } from '@/lib/utils';
import type { SellerRegisterFormValues } from '@/lib/validation/seller-schemas';
import type { SellerDocumentIcon, SellerPageViewModel } from '@/lib/view-models/seller';
import { SellerImageDropzone } from './seller-image-dropzone';

const MODEL_ICONS = {
  retail: Store,
  official: ShoppingBag,
  manufacturer: Factory,
} as const;

const DOCUMENT_ICONS: Record<
  SellerDocumentIcon,
  typeof FileBadge | typeof ShieldCheck | typeof Receipt
> = {
  authorization: FileBadge,
  quality: ShieldCheck,
  origin: Receipt,
};

function RequiredMark() {
  return (
    <span className="text-destructive" aria-hidden="true">
      {' '}
      *
    </span>
  );
}

function SectionIndex({ value }: { value: number }) {
  return (
    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-[12px] font-bold text-primary-foreground">
      {value}
    </span>
  );
}

export function SellerRegisterVerificationStep({
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

  return (
    <form
      className="mt-7 space-y-8"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <section className="space-y-4">
        <div className="flex items-start gap-3">
          <SectionIndex value={1} />
          <h3 className="pt-0.5 text-[15px] font-bold text-ink">
            Business model
            <RequiredMark />
          </h3>
        </div>
        <Controller
          control={form.control}
          name="sellingModel"
          render={({ field }) => (
            <fieldset
              aria-invalid={errors.sellingModel ? true : undefined}
              aria-describedby={errors.sellingModel ? 'seller-sellingModel-error' : undefined}
            >
              <legend className="sr-only">Business model</legend>
              <div className="grid items-stretch gap-3 sm:grid-cols-3">
                {page.sellingModels.map((model) => {
                  const selected = field.value === model.value;
                  const Icon = MODEL_ICONS[model.value as keyof typeof MODEL_ICONS] ?? Store;

                  return (
                    <label
                      key={model.value}
                      className={cn(
                        'relative flex h-full cursor-pointer flex-col rounded-2xl border-2 bg-white p-5 transition-colors',
                        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
                        selected
                          ? 'border-primary bg-primary/4 shadow-sm'
                          : 'border-border hover:border-primary/30 hover:bg-primary/2',
                        errors.sellingModel && !field.value && 'border-destructive',
                      )}
                    >
                      <input
                        type="radio"
                        name={field.name}
                        value={model.value}
                        checked={selected}
                        className="sr-only"
                        onBlur={field.onBlur}
                        onChange={() => field.onChange(model.value)}
                      />
                      <span className="flex items-center gap-3">
                        <span
                          className={cn(
                            'grid size-5 shrink-0 place-items-center rounded-full border',
                            selected ? 'border-primary bg-primary' : 'border-input bg-white',
                          )}
                          aria-hidden="true"
                        >
                          {selected ? <span className="size-2 rounded-full bg-white" /> : null}
                        </span>
                        <span className="relative">
                          <span
                            className={cn(
                              'grid size-11 place-items-center rounded-full',
                              selected
                                ? 'bg-primary/12 text-primary'
                                : 'bg-primary/8 text-muted-foreground',
                            )}
                            aria-hidden="true"
                          >
                            <Icon className="size-5" />
                          </span>
                          {selected ? (
                            <span className="absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm">
                              <Check className="size-2.5" strokeWidth={3} aria-hidden="true" />
                            </span>
                          ) : null}
                        </span>
                      </span>
                      <span className="mt-4 block text-[14px] font-bold text-ink">{model.label}</span>
                      <span className="mt-1 block text-[12px] leading-relaxed text-copy">
                        {model.description}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}
        />
        {errors.sellingModel?.message ? (
          <p id="seller-sellingModel-error" className="text-caption font-medium text-destructive" role="alert">
            {errors.sellingModel.message}
          </p>
        ) : null}
      </section>

      <section className="space-y-4">
        <div className="flex items-start gap-3">
          <SectionIndex value={2} />
          <div>
            <h3 className="pt-0.5 text-[15px] font-bold text-ink">
              Origin and authorization documents
              <RequiredMark />
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-copy">
              Please upload any supporting documents you have. These help us verify product origin and
              protect buyers.
            </p>
          </div>
        </div>
        <div className="grid items-stretch gap-4 lg:grid-cols-3">
          {page.verificationDocuments.map((document) => {
            const DocumentIcon = DOCUMENT_ICONS[document.icon] ?? FileBadge;

            return (
              <div
                key={document.field}
                className="flex h-full flex-col rounded-2xl border border-border bg-white p-4"
              >
                <div className="mb-3 flex items-start gap-3">
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/8 text-primary"
                    aria-hidden="true"
                  >
                    <DocumentIcon className="size-5" />
                  </span>
                  <div>
                    <p className="text-[13px] leading-snug font-bold text-ink">{document.title}</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-copy">{document.description}</p>
                  </div>
                </div>
                <div className="mt-auto">
                  <Controller
                    control={form.control}
                    name={document.field}
                    render={({ field }) => (
                      <SellerImageDropzone
                        id={`seller-${document.field}`}
                        label={document.title}
                        hideOptionalLabel
                        compact
                        hint="PDF, JPG, PNG (max 5MB)"
                        accept="application/pdf,image/png,image/jpeg"
                        value={field.value}
                        error={errors[document.field]?.message}
                        onBlur={field.onBlur}
                        onChange={(file) => {
                          field.onChange(file);
                          void form.trigger(document.field);
                        }}
                      />
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Alert variant="info" className="border-primary/20 bg-primary/8">
        <Shield className="text-primary" aria-hidden="true" />
        <AlertContent>
          <AlertTitle className="text-ink">Your information is secure</AlertTitle>
          <AlertDescription>
            We only use these documents to verify your seller profile and keep them protected.
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
          Next Step
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}
