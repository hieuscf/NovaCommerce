'use client';

import Link from 'next/link';
import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Globe, Mail, MapPin, Phone, User } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Checkbox } from '@novacommerce/ui/components/checkbox';
import { Input } from '@novacommerce/ui/components/input';
import { Label } from '@novacommerce/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@novacommerce/ui/components/select';
import { CheckoutSectionHeading } from '@/components/commerce/checkout/checkout-section-heading';
import type { CheckoutFormValues } from '@/lib/validation/checkout-schemas';
import type { CheckoutOptionViewModel } from '@/lib/view-models/checkout';
import { buildLoginHref } from '@/lib/auth/return-url';

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-caption font-medium text-destructive">
      {message}
    </p>
  );
}

export function CheckoutDetailsForm({
  control,
  errors,
  countries,
  regions,
  showGuestOptions,
  onCountryChange,
  onContinue,
}: {
  control: Control<CheckoutFormValues>;
  errors: Partial<Record<keyof CheckoutFormValues, { message?: string }>>;
  countries: readonly CheckoutOptionViewModel[];
  regions: readonly CheckoutOptionViewModel[];
  showGuestOptions: boolean;
  onCountryChange: (country: string) => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border/70 bg-surface p-5 shadow-card-soft sm:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <CheckoutSectionHeading step={1} title="Customer Information" className="mb-0" />
          {showGuestOptions ? (
            <p className="pt-1 text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link
                href={buildLoginHref('/checkout')}
                className="font-semibold text-primary hover:text-primary-strong focus-ring"
              >
                Sign in
              </Link>
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="checkout-fullName">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="fullName"
              render={({ field }) => (
                <Input
                  id="checkout-fullName"
                  autoComplete="name"
                  placeholder="Alex Johnson"
                  startAdornment={<User aria-hidden="true" />}
                  aria-invalid={errors.fullName ? true : undefined}
                  aria-describedby={errors.fullName ? 'checkout-fullName-error' : undefined}
                  {...field}
                />
              )}
            />
            <FieldError id="checkout-fullName-error" message={errors.fullName?.message} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="checkout-email">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Input
                  id="checkout-email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="alex.johnson@example.com"
                  startAdornment={<Mail aria-hidden="true" />}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? 'checkout-email-error' : undefined}
                  {...field}
                />
              )}
            />
            <FieldError id="checkout-email-error" message={errors.email?.message} />
          </div>

          <div className="grid gap-2 sm:col-span-2 sm:max-w-md">
            <Label htmlFor="checkout-phone">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <Input
                  id="checkout-phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+84 912 345 678"
                  startAdornment={<Phone aria-hidden="true" />}
                  aria-invalid={errors.phone ? true : undefined}
                  aria-describedby={errors.phone ? 'checkout-phone-error' : undefined}
                  {...field}
                />
              )}
            />
            <FieldError id="checkout-phone-error" message={errors.phone?.message} />
          </div>
        </div>

        {showGuestOptions ? (
          <label className="mt-5 flex items-center gap-2.5 text-sm text-foreground">
            <Controller
              control={control}
              name="createAccount"
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(value) => field.onChange(value === true)}
                  aria-label="Create an account for faster checkout"
                />
              )}
            />
            Create an account for faster checkout
          </label>
        ) : null}
      </section>

      <section className="rounded-2xl border border-border/70 bg-surface p-5 shadow-card-soft sm:p-6">
        <CheckoutSectionHeading
          step={2}
          title="Shipping Address"
          description="Enter your delivery address"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="checkout-addressLine1">
              Address Line 1 <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="addressLine1"
              render={({ field }) => (
                <Input
                  id="checkout-addressLine1"
                  autoComplete="address-line1"
                  placeholder="123 Tech Street"
                  startAdornment={<MapPin aria-hidden="true" />}
                  aria-invalid={errors.addressLine1 ? true : undefined}
                  aria-describedby={errors.addressLine1 ? 'checkout-addressLine1-error' : undefined}
                  {...field}
                />
              )}
            />
            <FieldError id="checkout-addressLine1-error" message={errors.addressLine1?.message} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="checkout-addressLine2">Address Line 2 (Optional)</Label>
            <Controller
              control={control}
              name="addressLine2"
              render={({ field }) => (
                <Input
                  id="checkout-addressLine2"
                  autoComplete="address-line2"
                  placeholder="Apartment, suite, etc."
                  startAdornment={<MapPin aria-hidden="true" />}
                  aria-invalid={errors.addressLine2 ? true : undefined}
                  aria-describedby={errors.addressLine2 ? 'checkout-addressLine2-error' : undefined}
                  {...field}
                />
              )}
            />
            <FieldError id="checkout-addressLine2-error" message={errors.addressLine2?.message} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="checkout-city">
              City <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="city"
              render={({ field }) => (
                <Input
                  id="checkout-city"
                  autoComplete="address-level2"
                  placeholder="Ho Chi Minh City"
                  startAdornment={<MapPin aria-hidden="true" />}
                  aria-invalid={errors.city ? true : undefined}
                  aria-describedby={errors.city ? 'checkout-city-error' : undefined}
                  {...field}
                />
              )}
            />
            <FieldError id="checkout-city-error" message={errors.city?.message} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="checkout-state">
              State/Province <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="state"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="checkout-state"
                    aria-invalid={errors.state ? true : undefined}
                    aria-describedby={errors.state ? 'checkout-state-error' : undefined}
                  >
                    <SelectValue placeholder="Select a province" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError id="checkout-state-error" message={errors.state?.message} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="checkout-postalCode">
              Postal Code <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="postalCode"
              render={({ field }) => (
                <Input
                  id="checkout-postalCode"
                  autoComplete="postal-code"
                  placeholder="700000"
                  startAdornment={<MapPin aria-hidden="true" />}
                  aria-invalid={errors.postalCode ? true : undefined}
                  aria-describedby={errors.postalCode ? 'checkout-postalCode-error' : undefined}
                  {...field}
                />
              )}
            />
            <FieldError id="checkout-postalCode-error" message={errors.postalCode?.message} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="checkout-country">
              Country <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="country"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    onCountryChange(value);
                  }}
                >
                  <SelectTrigger
                    id="checkout-country"
                    aria-invalid={errors.country ? true : undefined}
                    aria-describedby={errors.country ? 'checkout-country-error' : undefined}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Globe className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <SelectValue placeholder="Select a country" />
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError id="checkout-country-error" message={errors.country?.message} />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="button" variant="primary-gradient" className="h-12 rounded-xl px-6" onClick={onContinue}>
            Continue to Payment
            <span aria-hidden="true">→</span>
          </Button>
        </div>
      </section>
    </div>
  );
}
