'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@novacommerce/ui/components/toast';
import { Container } from '@novacommerce/ui/components/container';
import { ShopBreadcrumb } from '@/components/commerce/listing/shop-breadcrumb';
import { CheckoutDetailsForm } from '@/components/commerce/checkout/checkout-details-form';
import { CheckoutEmptyState } from '@/components/commerce/checkout/checkout-empty';
import { CheckoutErrorSummary } from '@/components/commerce/checkout/checkout-error-summary';
import { CheckoutPaymentForm } from '@/components/commerce/checkout/checkout-payment-form';
import { CheckoutReviewCard } from '@/components/commerce/checkout/checkout-review-card';
import { CheckoutStepper } from '@/components/commerce/checkout/checkout-stepper';
import { CheckoutSummary } from '@/components/commerce/checkout/checkout-summary';
import { CheckoutTrustBar } from '@/components/commerce/checkout/checkout-trust-bar';
import { placeCheckoutOrder } from '@/lib/checkout/place-order';
import { toFormError } from '@/lib/errors';
import {
  CHECKOUT_DETAILS_FIELDS,
  CHECKOUT_PAYMENT_FIELDS,
  checkoutFormSchema,
  type CheckoutFormValues,
} from '@/lib/validation/checkout-schemas';
import { summarizeCart, type CartLineViewModel } from '@/lib/view-models/cart';
import {
  checkoutCrumbsForStage,
  checkoutStageForStep,
  type CheckoutPageViewModel,
  type CheckoutStage,
  type CheckoutStepId,
} from '@/lib/view-models/checkout';

export function CheckoutPage({ checkout }: { checkout: CheckoutPageViewModel }) {
  const router = useRouter();
  const [stage, setStage] = useState<CheckoutStage>('details');
  const [lines, setLines] = useState<CartLineViewModel[]>(() => [...checkout.lines]);
  const [submitting, setSubmitting] = useState(false);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const summary = useMemo(() => summarizeCart(lines), [lines]);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: checkout.customer.fullName,
      email: checkout.customer.email,
      phone: checkout.customer.phone,
      createAccount: checkout.customer.createAccount,
      addressLine1: checkout.shipping.addressLine1,
      addressLine2: checkout.shipping.addressLine2,
      city: checkout.shipping.city,
      state: checkout.shipping.state,
      postalCode: checkout.shipping.postalCode,
      country: checkout.shipping.country,
      paymentMethod: 'card',
      cardNumber: '',
      cardholderName: checkout.customer.fullName,
      cardExpiration: '',
      cardCvv: '',
      otpCode: '',
    },
  });

  const watched = form.watch();
  const regions = checkout.regionsByCountry[watched.country] ?? [];
  const crumbs = checkoutCrumbsForStage(stage);
  const paymentLabel =
    checkout.paymentMethods.find((method) => method.id === watched.paymentMethod)?.label ??
    'Not selected';

  function focusErrorSummary() {
    requestAnimationFrame(() => {
      errorSummaryRef.current?.focus();
    });
  }

  async function goToPayment() {
    const valid = await form.trigger(CHECKOUT_DETAILS_FIELDS);
    if (!valid) {
      focusErrorSummary();
      return;
    }
    setStage('payment');
  }

  async function goToReview() {
    const detailsValid = await form.trigger(CHECKOUT_DETAILS_FIELDS);
    const paymentValid = await form.trigger(CHECKOUT_PAYMENT_FIELDS);
    if (!detailsValid || !paymentValid) {
      if (!detailsValid) setStage('details');
      else setStage('payment');
      focusErrorSummary();
      return;
    }
    setStage('review');
  }

  async function placeOrder() {
    const valid = await form.trigger();
    if (!valid) {
      setStage('details');
      focusErrorSummary();
      return;
    }
    setSubmitting(true);
    try {
      const values = form.getValues();
      await placeCheckoutOrder({
        values,
        paymentMethod: values.paymentMethod,
      });
      router.push('/orders/confirmed');
    } catch (error) {
      toast.error('Could not place order', { description: toFormError(error) });
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePrimaryAction() {
    if (stage === 'details') {
      await goToPayment();
      return;
    }
    if (stage === 'payment') {
      await goToReview();
      return;
    }
    await placeOrder();
  }

  function handleStepSelect(stepId: CheckoutStepId) {
    setStage(checkoutStageForStep(stepId));
  }

  function handleCountryChange(nextCountry: string) {
    const nextRegions = checkout.regionsByCountry[nextCountry] ?? [];
    form.setValue('state', nextRegions[0]?.value ?? '');
  }

  function handleQuantityChange(id: string, quantity: number) {
    setLines((current) => current.map((line) => (line.id === id ? { ...line, quantity } : line)));
  }

  function handleRemove(id: string) {
    setLines((current) => current.filter((line) => line.id !== id));
  }

  if (lines.length === 0) {
    return (
      <div className="bg-page-canvas min-h-svh">
        <Container size="wide" className="py-8 lg:py-10">
          <h1 className="sr-only">Checkout</h1>
          <ShopBreadcrumb crumbs={crumbs} />
          <div className="mt-8">
            <CheckoutEmptyState />
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-page-canvas min-h-svh">
      <Container size="wide" className="py-8 lg:py-10">
        <h1 className="sr-only">Checkout</h1>
        <form
            noValidate
            className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_380px]"
            onSubmit={(event) => {
              event.preventDefault();
              void handlePrimaryAction();
            }}
          >
            <div className="min-w-0 space-y-6">
              <ShopBreadcrumb crumbs={crumbs} />
              <CheckoutStepper stage={stage} onStepSelect={handleStepSelect} />
              <CheckoutErrorSummary errors={form.formState.errors} summaryRef={errorSummaryRef} />

                {stage === 'details' ? (
                  <CheckoutDetailsForm
                    control={form.control}
                    errors={form.formState.errors}
                    countries={checkout.countries}
                    regions={regions}
                    showGuestOptions
                    onCountryChange={handleCountryChange}
                    onContinue={() => void goToPayment()}
                  />
                ) : null}

                {stage === 'payment' ? (
                  <CheckoutPaymentForm
                    control={form.control}
                    errors={form.formState.errors}
                    methods={checkout.paymentMethods}
                    phone={watched.phone}
                    summary={summary}
                    onBack={() => setStage('details')}
                    onContinue={() => void goToReview()}
                  />
                ) : null}

                {stage === 'review' ? (
                  <CheckoutReviewCard
                    values={watched}
                    checkout={checkout}
                    paymentLabel={paymentLabel}
                    submitting={submitting}
                    onBack={() => setStage('payment')}
                    onPlaceOrder={() => void placeOrder()}
                    onEditDetails={() => setStage('details')}
                    onEditPayment={() => setStage('payment')}
                  />
                ) : null}

                {stage === 'details' ? <CheckoutTrustBar /> : null}
              </div>

              <CheckoutSummary
                lines={lines}
                summary={summary}
                stage={stage}
                submitting={submitting}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
                onPrimaryAction={() => void handlePrimaryAction()}
              />
            </form>
      </Container>
    </div>
  );
}
