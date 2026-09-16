'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Shield } from 'lucide-react';
import { Alert, AlertContent, AlertDescription, AlertTitle } from '@novacommerce/ui/components/alert';
import { Button } from '@novacommerce/ui/components/button';
import { Input } from '@novacommerce/ui/components/input';
import { Label } from '@novacommerce/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@novacommerce/ui/components/select';
import { Textarea } from '@novacommerce/ui/components/textarea';
import { buildLoginHref } from '@/lib/auth/return-url';
import { cn } from '@/lib/utils';
import {
  SELLER_BUSINESS_FIELDS,
  SELLER_SHOP_FIELDS,
  SELLER_VERIFICATION_FIELDS,
  sellerRegisterSchema,
  toShopSlug,
  type SellerRegisterFormValues,
} from '@/lib/validation/seller-schemas';
import type { SellerPageViewModel, SellerRegisterStepId } from '@/lib/view-models/seller';
import { SellerFlag } from './seller-flag';
import { SellerRegisterStepper } from './seller-register-stepper';

const fieldClass =
  'h-11 rounded-xl border-border bg-white text-[13.5px] placeholder:text-muted-foreground';
const selectClass =
  'h-11 rounded-xl border-border bg-white text-[13.5px] font-normal data-placeholder:text-muted-foreground';

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-caption font-medium text-destructive">
      {message}
    </p>
  );
}

function RequiredMark() {
  return (
    <span className="text-destructive" aria-hidden="true">
      {' '}
      *
    </span>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <h3 className="text-[15px] font-bold text-ink">{children}</h3>;
}

export function SellerRegisterForm({ page }: { page: SellerPageViewModel }) {
  const [step, setStep] = useState<SellerRegisterStepId>('business');
  const [slugTouched, setSlugTouched] = useState(false);
  const formTopRef = useRef<HTMLDivElement>(null);

  const form = useForm<SellerRegisterFormValues>({
    resolver: zodResolver(sellerRegisterSchema),
    defaultValues: {
      businessName: '',
      businessType: '',
      legalBusinessName: '',
      taxId: '',
      businessEmail: '',
      phoneCountry: 'VN',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      shopName: '',
      shopSlug: '',
      shopCategory: '',
      shopDescription: '',
      representativeName: '',
      documentType: '',
      documentNumber: '',
    },
  });

  const errors = form.formState.errors;
  const selectedDial =
    page.dialCodes.find((item) => item.value === form.watch('phoneCountry')) ?? page.dialCodes[0];

  function focusFormTop() {
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function goToStep(next: SellerRegisterStepId) {
    setStep(next);
    focusFormTop();
  }

  async function handleNext() {
    if (step === 'business') {
      const valid = await form.trigger([...SELLER_BUSINESS_FIELDS]);
      if (valid) await goToStep('shop');
      return;
    }

    if (step === 'shop') {
      const valid = await form.trigger([...SELLER_SHOP_FIELDS]);
      if (valid) await goToStep('verification');
      return;
    }

    if (step === 'verification') {
      const valid = await form.trigger([...SELLER_VERIFICATION_FIELDS]);
      if (valid) await goToStep('complete');
    }
  }

  const copy =
    step === 'business'
      ? {
          title: 'Become a Seller',
          description:
            'Tell us about your business. This information will help us verify your account and set up your seller profile.',
        }
      : step === 'shop'
        ? {
            title: 'Set up your shop',
            description:
              'Choose how customers will find you. You can update these details later from Seller Center.',
          }
        : step === 'verification'
          ? {
              title: 'Terms & Verification',
              description:
                'We use this information to confirm you are authorized to sell. Keep it accurate so review stays fast.',
            }
          : {
              title: 'Application received',
              description:
                'Thanks for applying. Our team will review your details and email you when your seller profile is ready.',
            };

  return (
    <div
      ref={formTopRef}
      className="rounded-[28px] border border-white/80 bg-white p-6 shadow-premium sm:p-8 lg:p-10"
    >
      <SellerRegisterStepper
        current={step}
        onStepSelect={(next) => {
          void goToStep(next);
        }}
      />

      <h2 className="mt-8 text-[28px] font-extrabold tracking-tight text-ink">{copy.title}</h2>
      <p className="mt-2 max-w-[520px] text-[14px] leading-relaxed text-copy">{copy.description}</p>

      {step === 'business' ? (
        <form
          className="mt-7 space-y-7"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void handleNext();
          }}
        >
          <section className="space-y-4">
            <SectionTitle>Business Information</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="seller-businessName">
                  Business Name
                  <RequiredMark />
                </Label>
                <Controller
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <Input
                      id="seller-businessName"
                      autoComplete="organization"
                      placeholder="Enter your business name"
                      className={fieldClass}
                      aria-invalid={errors.businessName ? true : undefined}
                      aria-describedby={errors.businessName ? 'seller-businessName-error' : undefined}
                      {...field}
                    />
                  )}
                />
                <FieldError id="seller-businessName-error" message={errors.businessName?.message} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="seller-businessType">
                  Business Type
                  <RequiredMark />
                </Label>
                <Controller
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="seller-businessType"
                        className={selectClass}
                        aria-invalid={errors.businessType ? true : undefined}
                        aria-describedby={errors.businessType ? 'seller-businessType-error' : undefined}
                      >
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        {page.businessTypes.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError id="seller-businessType-error" message={errors.businessType?.message} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="seller-legalBusinessName">
                  Legal Business Name
                  <RequiredMark />
                </Label>
                <Controller
                  control={form.control}
                  name="legalBusinessName"
                  render={({ field }) => (
                    <Input
                      id="seller-legalBusinessName"
                      autoComplete="organization"
                      placeholder="Enter legal business name"
                      className={fieldClass}
                      aria-invalid={errors.legalBusinessName ? true : undefined}
                      aria-describedby={
                        errors.legalBusinessName ? 'seller-legalBusinessName-error' : undefined
                      }
                      {...field}
                    />
                  )}
                />
                <FieldError
                  id="seller-legalBusinessName-error"
                  message={errors.legalBusinessName?.message}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="seller-taxId">
                  Tax ID / Business Registration Number
                  <RequiredMark />
                </Label>
                <Controller
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <Input
                      id="seller-taxId"
                      placeholder="Enter tax ID or business registration number"
                      className={fieldClass}
                      aria-invalid={errors.taxId ? true : undefined}
                      aria-describedby={errors.taxId ? 'seller-taxId-error' : undefined}
                      {...field}
                    />
                  )}
                />
                <FieldError id="seller-taxId-error" message={errors.taxId?.message} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="seller-businessEmail">
                  Business Email
                  <RequiredMark />
                </Label>
                <Controller
                  control={form.control}
                  name="businessEmail"
                  render={({ field }) => (
                    <Input
                      id="seller-businessEmail"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="Enter business email"
                      className={fieldClass}
                      aria-invalid={errors.businessEmail ? true : undefined}
                      aria-describedby={errors.businessEmail ? 'seller-businessEmail-error' : undefined}
                      {...field}
                    />
                  )}
                />
                <FieldError id="seller-businessEmail-error" message={errors.businessEmail?.message} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="seller-phone">
                  Phone Number
                  <RequiredMark />
                </Label>
                <div
                  className={cn(
                    'flex h-11 overflow-hidden rounded-xl border border-input bg-white shadow-sm',
                    'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
                    errors.phone && 'border-destructive',
                  )}
                >
                  <Controller
                    control={form.control}
                    name="phoneCountry"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          aria-label="Phone country code"
                          className="h-full w-[7.75rem] shrink-0 rounded-none border-0 bg-transparent px-3 shadow-none focus-visible:ring-0"
                        >
                          <span className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                            <SellerFlag code={selectedDial?.value ?? 'VN'} />
                            {selectedDial?.dial}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          {page.dialCodes.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <span className="flex items-center gap-2">
                                <SellerFlag code={option.value} />
                                {option.dial} {option.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <Input
                        id="seller-phone"
                        type="tel"
                        autoComplete="tel-national"
                        inputMode="tel"
                        placeholder="912 345 678"
                        className="h-full rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0"
                        aria-invalid={errors.phone ? true : undefined}
                        aria-describedby={errors.phone ? 'seller-phone-error' : undefined}
                        {...field}
                      />
                    )}
                  />
                </div>
                <FieldError id="seller-phone-error" message={errors.phone?.message} />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <SectionTitle>Business Address</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="seller-addressLine1">
                  Address Line 1
                  <RequiredMark />
                </Label>
                <Controller
                  control={form.control}
                  name="addressLine1"
                  render={({ field }) => (
                    <Input
                      id="seller-addressLine1"
                      autoComplete="address-line1"
                      placeholder="Enter street address"
                      className={fieldClass}
                      aria-invalid={errors.addressLine1 ? true : undefined}
                      aria-describedby={errors.addressLine1 ? 'seller-addressLine1-error' : undefined}
                      {...field}
                    />
                  )}
                />
                <FieldError id="seller-addressLine1-error" message={errors.addressLine1?.message} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="seller-addressLine2">Address Line 2 (Optional)</Label>
                <Controller
                  control={form.control}
                  name="addressLine2"
                  render={({ field }) => (
                    <Input
                      id="seller-addressLine2"
                      autoComplete="address-line2"
                      placeholder="Apartment, suite, etc."
                      className={fieldClass}
                      aria-invalid={errors.addressLine2 ? true : undefined}
                      aria-describedby={errors.addressLine2 ? 'seller-addressLine2-error' : undefined}
                      {...field}
                    />
                  )}
                />
                <FieldError id="seller-addressLine2-error" message={errors.addressLine2?.message} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="seller-city">
                  City
                  <RequiredMark />
                </Label>
                <Controller
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="seller-city"
                        className={selectClass}
                        aria-invalid={errors.city ? true : undefined}
                        aria-describedby={errors.city ? 'seller-city-error' : undefined}
                      >
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {page.cities.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError id="seller-city-error" message={errors.city?.message} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="seller-state">
                  State / Province
                  <RequiredMark />
                </Label>
                <Controller
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="seller-state"
                        className={selectClass}
                        aria-invalid={errors.state ? true : undefined}
                        aria-describedby={errors.state ? 'seller-state-error' : undefined}
                      >
                        <SelectValue placeholder="Select state/province" />
                      </SelectTrigger>
                      <SelectContent>
                        {page.states.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError id="seller-state-error" message={errors.state?.message} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="seller-postalCode">
                  Postal Code
                  <RequiredMark />
                </Label>
                <Controller
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <Input
                      id="seller-postalCode"
                      autoComplete="postal-code"
                      placeholder="Enter postal code"
                      className={fieldClass}
                      aria-invalid={errors.postalCode ? true : undefined}
                      aria-describedby={errors.postalCode ? 'seller-postalCode-error' : undefined}
                      {...field}
                    />
                  )}
                />
                <FieldError id="seller-postalCode-error" message={errors.postalCode?.message} />
              </div>
            </div>
          </section>

          <Alert variant="info" className="border-primary/20 bg-primary/8">
            <Shield className="text-primary" aria-hidden="true" />
            <AlertContent>
              <AlertTitle className="text-ink">Your information is secure</AlertTitle>
              <AlertDescription>
                We use industry-standard encryption to protect your data and keep your account safe.
              </AlertDescription>
            </AlertContent>
          </Alert>

          <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-muted-foreground">
              Already have a seller account?{' '}
              <Link
                href={buildLoginHref('/seller')}
                className="font-semibold text-primary hover:text-primary-strong focus-ring"
              >
                Sign in
              </Link>
            </p>
            <Button type="submit" className="h-11 rounded-full px-7">
              Next Step
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </form>
      ) : null}

      {step === 'shop' ? (
        <form
          className="mt-7 space-y-5"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void handleNext();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="seller-shopName">
                Shop Name
                <RequiredMark />
              </Label>
              <Controller
                control={form.control}
                name="shopName"
                render={({ field }) => (
                  <Input
                    id="seller-shopName"
                    placeholder="Enter your shop name"
                    className={fieldClass}
                    aria-invalid={errors.shopName ? true : undefined}
                    aria-describedby={errors.shopName ? 'seller-shopName-error' : undefined}
                    {...field}
                    onChange={(event) => {
                      field.onChange(event);
                      if (!slugTouched) {
                        form.setValue('shopSlug', toShopSlug(event.target.value), {
                          shouldValidate: false,
                        });
                      }
                    }}
                  />
                )}
              />
              <FieldError id="seller-shopName-error" message={errors.shopName?.message} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="seller-shopSlug">
                Shop URL
                <RequiredMark />
              </Label>
              <Controller
                control={form.control}
                name="shopSlug"
                render={({ field }) => (
                  <Input
                    id="seller-shopSlug"
                    placeholder="your-shop"
                    className={fieldClass}
                    aria-invalid={errors.shopSlug ? true : undefined}
                    aria-describedby={errors.shopSlug ? 'seller-shopSlug-error' : undefined}
                    {...field}
                    onChange={(event) => {
                      setSlugTouched(true);
                      field.onChange(toShopSlug(event.target.value));
                    }}
                  />
                )}
              />
              <FieldError id="seller-shopSlug-error" message={errors.shopSlug?.message} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="seller-shopCategory">
              Primary Category
              <RequiredMark />
            </Label>
            <Controller
              control={form.control}
              name="shopCategory"
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="seller-shopCategory"
                    className={selectClass}
                    aria-invalid={errors.shopCategory ? true : undefined}
                    aria-describedby={errors.shopCategory ? 'seller-shopCategory-error' : undefined}
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {page.shopCategories.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError id="seller-shopCategory-error" message={errors.shopCategory?.message} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="seller-shopDescription">
              Shop Description
              <RequiredMark />
            </Label>
            <Controller
              control={form.control}
              name="shopDescription"
              render={({ field }) => (
                <Textarea
                  id="seller-shopDescription"
                  placeholder="Tell customers what you sell"
                  aria-invalid={errors.shopDescription ? true : undefined}
                  aria-describedby={errors.shopDescription ? 'seller-shopDescription-error' : undefined}
                  {...field}
                />
              )}
            />
            <FieldError id="seller-shopDescription-error" message={errors.shopDescription?.message} />
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
            <Button type="button" variant="secondary" className="rounded-full" onClick={() => void goToStep('business')}>
              Back
            </Button>
            <Button type="submit" className="rounded-full px-7">
              Next Step
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </form>
      ) : null}

      {step === 'verification' ? (
        <form
          className="mt-7 space-y-5"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void handleNext();
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="seller-representativeName">
              Authorized Representative
              <RequiredMark />
            </Label>
            <Controller
              control={form.control}
              name="representativeName"
              render={({ field }) => (
                <Input
                  id="seller-representativeName"
                  autoComplete="name"
                  placeholder="Full legal name"
                  className={fieldClass}
                  aria-invalid={errors.representativeName ? true : undefined}
                  aria-describedby={
                    errors.representativeName ? 'seller-representativeName-error' : undefined
                  }
                  {...field}
                />
              )}
            />
            <FieldError
              id="seller-representativeName-error"
              message={errors.representativeName?.message}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="seller-documentType">
                Document Type
                <RequiredMark />
              </Label>
              <Controller
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="seller-documentType"
                      className={selectClass}
                      aria-invalid={errors.documentType ? true : undefined}
                      aria-describedby={errors.documentType ? 'seller-documentType-error' : undefined}
                    >
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {page.documentTypes.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError id="seller-documentType-error" message={errors.documentType?.message} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="seller-documentNumber">
                Document Number
                <RequiredMark />
              </Label>
              <Controller
                control={form.control}
                name="documentNumber"
                render={({ field }) => (
                  <Input
                    id="seller-documentNumber"
                    placeholder="Enter document number"
                    className={fieldClass}
                    aria-invalid={errors.documentNumber ? true : undefined}
                    aria-describedby={errors.documentNumber ? 'seller-documentNumber-error' : undefined}
                    {...field}
                  />
                )}
              />
              <FieldError id="seller-documentNumber-error" message={errors.documentNumber?.message} />
            </div>
          </div>

          <Alert variant="info">
            <Shield aria-hidden="true" />
            <AlertContent>
              <AlertTitle>What happens next</AlertTitle>
              <AlertDescription>
                We will email you if we need supporting documents. You can continue shopping while
                we review your application.
              </AlertDescription>
            </AlertContent>
          </Alert>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
            <Button type="button" variant="secondary" className="rounded-full" onClick={() => void goToStep('shop')}>
              Back
            </Button>
            <Button type="submit" className="rounded-full px-7">
              Submit application
            </Button>
          </div>
        </form>
      ) : null}

      {step === 'complete' ? (
        <div className="mt-8 space-y-6">
          <Alert variant="success">
            <Shield aria-hidden="true" />
            <AlertContent>
              <AlertTitle>We have your application</AlertTitle>
              <AlertDescription>
                We will email the business address you provided when the review is complete.
              </AlertDescription>
            </AlertContent>
          </Alert>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-full px-7">
              <Link href="/shop">Start shopping</Link>
            </Button>
            <Button asChild variant="secondary" className="rounded-full">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
