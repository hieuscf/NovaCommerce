'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Separator } from '@novacommerce/ui/components/separator';
import { CheckoutSectionHeading } from '@/components/commerce/checkout/checkout-section-heading';
import { formatCheckoutAddress, type CheckoutPageViewModel } from '@/lib/view-models/checkout';
import type { CheckoutFormValues } from '@/lib/validation/checkout-schemas';

export function CheckoutReviewCard({
  values,
  checkout,
  paymentLabel,
  submitting,
  onBack,
  onPlaceOrder,
  onEditDetails,
  onEditPayment,
}: {
  values: CheckoutFormValues;
  checkout: CheckoutPageViewModel;
  paymentLabel: string;
  submitting: boolean;
  onBack: () => void;
  onPlaceOrder: () => void;
  onEditDetails: () => void;
  onEditPayment: () => void;
}) {
  const regions = checkout.regionsByCountry[values.country] ?? [];
  const address = formatCheckoutAddress(values, checkout.countries, regions);

  return (
    <section className="rounded-2xl border border-border/70 bg-surface p-5 shadow-card-soft sm:p-6">
      <CheckoutSectionHeading
        step={4}
        title="Review Order"
        description="Confirm your details before placing the order"
      />

      <dl className="space-y-4 text-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <dt className="font-semibold text-ink">Customer</dt>
            <dd className="mt-1 text-muted-foreground">
              <p>{values.fullName}</p>
              <p>{values.email}</p>
              <p>{values.phone}</p>
            </dd>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onEditDetails}>
            Edit
          </Button>
        </div>
        <Separator />
        <div className="flex items-start justify-between gap-4">
          <div>
            <dt className="font-semibold text-ink">Shipping address</dt>
            <dd className="mt-1 text-muted-foreground">{address}</dd>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onEditDetails}>
            Edit
          </Button>
        </div>
        <Separator />
        <div className="flex items-start justify-between gap-4">
          <div>
            <dt className="font-semibold text-ink">Payment</dt>
            <dd className="mt-1 text-muted-foreground">{paymentLabel}</dd>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onEditPayment}>
            Edit
          </Button>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onBack}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to payment
        </Button>
        <Button
          type="button"
          variant="primary-gradient"
          className="h-12 rounded-xl px-6"
          loading={submitting}
          loadingLabel="Placing order"
          onClick={onPlaceOrder}
        >
          Place order
        </Button>
      </div>
    </section>
  );
}
