'use client';

import { useEffect, useState } from 'react';
import type { Control, FieldErrors } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import {
  ArrowLeft,
  Calendar,
  Check,
  CreditCard,
  Lock,
  QrCode,
  ShieldCheck,
  Smartphone,
  User,
} from 'lucide-react';
import { toast } from '@novacommerce/ui/components/toast';
import { Button } from '@novacommerce/ui/components/button';
import { Input } from '@novacommerce/ui/components/input';
import { Label } from '@novacommerce/ui/components/label';
import { RadioGroup, RadioGroupItem } from '@novacommerce/ui/components/radio-group';
import { CheckoutPaymentAssurance } from '@/components/commerce/checkout/checkout-payment-assurance';
import {
  CardNetworkMarks,
  GooglePayMark,
} from '@/components/commerce/checkout/checkout-payment-marks';
import {
  formatCardExpiration,
  formatCardNumber,
  formatOtpCode,
  formatOtpCountdown,
} from '@/lib/checkout/card-input';
import { cn } from '@/lib/utils';
import type { CheckoutFormValues } from '@/lib/validation/checkout-schemas';
import type { SavedPaymentMethodViewModel } from '@/lib/payment/mappers';
import {
  formatCartMoney,
  type CartSummaryViewModel,
} from '@/lib/view-models/cart';
import type {
  CheckoutPaymentMethodId,
  CheckoutPaymentMethodViewModel,
} from '@/lib/view-models/checkout';

const OTP_SECONDS = 45;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-caption font-medium text-destructive">
      {message}
    </p>
  );
}

function MethodMark({ id }: { id: CheckoutPaymentMethodId }) {
  if (id === 'paypal') {
    return <span className="text-lg font-extrabold tracking-tight text-[#003087]">P</span>;
  }
  if (id === 'qr_pay') return <QrCode className="size-5" aria-hidden="true" />;
  if (id === 'google_pay') return <GooglePayMark />;
  return <CreditCard className="size-5" aria-hidden="true" />;
}

export function CheckoutPaymentForm({
  control,
  errors,
  methods,
  savedCards = [],
  phone,
  summary,
  onBack,
  onContinue,
}: {
  control: Control<CheckoutFormValues>;
  errors: FieldErrors<CheckoutFormValues>;
  methods: readonly CheckoutPaymentMethodViewModel[];
  savedCards?: readonly SavedPaymentMethodViewModel[];
  phone: string;
  summary: CartSummaryViewModel;
  onBack: () => void;
  onContinue: () => void;
}) {
  const [otpSeconds, setOtpSeconds] = useState(OTP_SECONDS);
  const methodError = errors.paymentMethod?.message;

  useEffect(() => {
    if (otpSeconds <= 0) return;
    const timeoutId = window.setTimeout(() => {
      setOtpSeconds((current) => current - 1);
    }, 1000);
    return () => window.clearTimeout(timeoutId);
  }, [otpSeconds]);

  function handleResend() {
    setOtpSeconds(OTP_SECONDS);
    toast.success('OTP timer reset', {
      description: 'Preview only — no SMS is sent.',
    });
  }

  return (
    <section className="rounded-[28px] border border-border/70 bg-surface p-5 shadow-card-soft sm:p-6">
      <h2 className="text-lg font-semibold text-ink">Payment Method</h2>

      <Controller
        control={control}
        name="paymentMethod"
        render={({ field }) => (
          <>
            <RadioGroup
              value={field.value ?? ''}
              onValueChange={field.onChange}
              className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4"
              aria-labelledby="checkout-paymentMethod"
              aria-invalid={methodError ? true : undefined}
              aria-describedby={methodError ? 'checkout-paymentMethod-error' : undefined}
            >
              <span id="checkout-paymentMethod" className="sr-only">
                Payment method
              </span>
              {methods.map((method) => {
                const selected = field.value === method.id;
                return (
                  <label
                    key={method.id}
                    className={cn(
                      'relative flex min-h-[108px] cursor-pointer flex-col rounded-2xl border px-3.5 py-3.5 transition-colors duration-fast',
                      'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2',
                      selected
                        ? 'border-primary bg-primary-tint/70 shadow-[0_10px_24px_-18px_rgba(79,70,229,0.8)]'
                        : 'border-border/80 bg-surface hover:border-primary/30',
                    )}
                  >
                    <RadioGroupItem value={method.id} className="sr-only" />
                    <span
                      className={cn(
                        'absolute top-3 right-3 grid size-5 place-items-center rounded-full',
                        selected ? 'bg-primary text-primary-foreground' : 'hidden',
                      )}
                      aria-hidden="true"
                    >
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    <span
                      className={cn(
                        'grid size-10 place-items-center rounded-xl',
                        selected ? 'bg-surface text-primary shadow-sm' : 'bg-surface-subtle text-ink',
                      )}
                    >
                      <MethodMark id={method.id} />
                    </span>
                    <span className="mt-3 text-sm font-semibold text-ink">{method.label}</span>
                    <span className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{method.description}</span>
                  </label>
                );
              })}
            </RadioGroup>
            {methodError ? (
              <p id="checkout-paymentMethod-error" className="mt-3 text-caption font-medium text-destructive">
                {methodError}
              </p>
            ) : null}

            {field.value === 'card' ? (
              <CardFields
                control={control}
                errors={errors}
                savedCards={savedCards}
                phone={phone}
                otpSeconds={otpSeconds}
                onResend={handleResend}
              />
            ) : field.value === 'qr_pay' ? (
              <QrPayNote />
            ) : field.value ? (
              <WalletNote method={methods.find((item) => item.id === field.value)} />
            ) : null}
          </>
        )}
      />

      <div className="mt-6 flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <Button type="button" variant="ghost" className="justify-start text-muted-foreground" onClick={onBack}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Shipping
        </Button>
        <Button
          type="button"
          variant="primary-gradient"
          className="h-12 rounded-xl px-6"
          onClick={onContinue}
        >
          <Lock className="size-4" aria-hidden="true" />
          Pay Now {formatCartMoney(summary.total, summary.currency)}
          <span aria-hidden="true">→</span>
        </Button>
      </div>

      <div className="mt-6">
        <CheckoutPaymentAssurance />
      </div>
    </section>
  );
}

function WalletNote({ method }: { method?: CheckoutPaymentMethodViewModel }) {
  if (!method) return null;
  return (
    <div className="mt-5 rounded-2xl border border-border/70 bg-surface-subtle px-4 py-4">
      <p className="text-sm font-semibold text-ink">Continue with {method.label}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Confirm on the next step. This preview does not open a wallet or charge a payment provider.
      </p>
    </div>
  );
}

function QrPayNote() {
  return (
    <div className="mt-5 flex flex-col items-center rounded-2xl border border-border/70 bg-surface-subtle px-4 py-5 text-center sm:px-5">
      <span className="grid size-12 place-items-center rounded-2xl bg-primary-tint text-primary">
        <QrCode className="size-6" aria-hidden="true" />
      </span>
      <h3 className="mt-3 text-sm font-semibold text-ink">Scan to pay</h3>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        Open your banking app and scan the QR code. This preview does not create a real payment.
      </p>
      <div
        className="mt-4 grid grid-cols-5 gap-1 rounded-xl bg-surface p-3 shadow-sm"
        aria-hidden="true"
      >
        {Array.from({ length: 25 }, (_, index) => (
          <span
            key={index}
            className={index % 3 === 0 || index === 12 ? 'size-3 rounded-[2px] bg-ink' : 'size-3 rounded-[2px] bg-border'}
          />
        ))}
      </div>
    </div>
  );
}

function CardFields({
  control,
  errors,
  savedCards,
  phone,
  otpSeconds,
  onResend,
}: {
  control: Control<CheckoutFormValues>;
  errors: FieldErrors<CheckoutFormValues>;
  savedCards: readonly SavedPaymentMethodViewModel[];
  phone: string;
  otpSeconds: number;
  onResend: () => void;
}) {
  const canResend = otpSeconds === 0;

  return (
    <div className="mt-5 space-y-5">
      {savedCards.length > 0 ? (
        <section className="rounded-2xl border border-border/70 bg-surface p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-ink">Saved cards</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            CVV is never stored. Enter it each time you pay with a saved card.
          </p>
          <Controller
            control={control}
            name="savedPaymentMethodId"
            render={({ field }) => (
              <RadioGroup
                value={field.value ?? '__new__'}
                onValueChange={(value) =>
                  field.onChange(value === '__new__' ? undefined : value)
                }
                className="mt-3 space-y-2"
              >
                {savedCards.map((card) => (
                  <label
                    key={card.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3',
                      field.value === card.id ? 'border-primary bg-primary-tint/40' : 'border-border/70',
                    )}
                  >
                    <RadioGroupItem value={card.id} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink">{card.maskedLabel}</span>
                      <span className="block text-xs text-muted-foreground">
                        Expires {card.expLabel}
                        {card.isDefault ? ' · Default' : ''}
                      </span>
                    </span>
                  </label>
                ))}
                <label
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3',
                    !field.value ? 'border-primary bg-primary-tint/40' : 'border-border/70',
                  )}
                >
                  <RadioGroupItem value="__new__" />
                  <span className="text-sm font-semibold text-ink">Use a new card</span>
                </label>
              </RadioGroup>
            )}
          />
        </section>
      ) : null}

      <Controller
        control={control}
        name="savedPaymentMethodId"
        render={({ field: savedField }) =>
          savedField.value ? (
            <section className="rounded-2xl border border-border/70 bg-surface p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-ink">Confirm with CVV</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Required for this payment. CVV is not saved on your account.
              </p>
              <div className="mt-4 max-w-[140px] space-y-2">
                <Label htmlFor="checkout-cardCvv">CVV / CVC</Label>
                <Controller
                  control={control}
                  name="cardCvv"
                  render={({ field }) => (
                    <Input
                      id="checkout-cardCvv"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="•••"
                      maxLength={4}
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.value.replace(/\D/g, '').slice(0, 4))}
                      aria-invalid={Boolean(errors.cardCvv)}
                      aria-describedby={errors.cardCvv ? 'checkout-cardCvv-error' : undefined}
                    />
                  )}
                />
                <FieldError id="checkout-cardCvv-error" message={errors.cardCvv?.message} />
              </div>
            </section>
          ) : (
            <NewCardFields
              control={control}
              errors={errors}
              phone={phone}
              otpSeconds={otpSeconds}
              canResend={canResend}
              onResend={onResend}
            />
          )
        }
      />
    </div>
  );
}

function NewCardFields({
  control,
  errors,
  phone,
  otpSeconds,
  canResend,
  onResend,
}: {
  control: Control<CheckoutFormValues>;
  errors: FieldErrors<CheckoutFormValues>;
  phone: string;
  otpSeconds: number;
  canResend: boolean;
  onResend: () => void;
}) {
  return (
    <>
      <section className="rounded-2xl border border-border/70 bg-surface p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary-tint text-primary">
              <CreditCard className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-ink">Card Information</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Enter card details. CVV is used for this payment only and is never saved.
              </p>
            </div>
          </div>
          <CardNetworkMarks className="hidden sm:flex" />
        </div>

        <div className="mt-4 grid gap-2">
          <Label htmlFor="checkout-cardNumber">
            Card Number <span className="text-destructive">*</span>
          </Label>
          <Controller
            control={control}
            name="cardNumber"
            render={({ field }) => (
              <Input
                id="checkout-cardNumber"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="1234 5678 9012 3456"
                startAdornment={<CreditCard aria-hidden="true" />}
                endAdornment={<CardNetworkMarks className="sm:hidden" />}
                value={field.value}
                aria-invalid={errors.cardNumber ? true : undefined}
                aria-describedby={errors.cardNumber ? 'checkout-cardNumber-error' : undefined}
                onChange={(event) => field.onChange(formatCardNumber(event.target.value))}
                onBlur={field.onBlur}
              />
            )}
          />
          <FieldError id="checkout-cardNumber-error" message={errors.cardNumber?.message} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.7fr)]">
          <div className="grid gap-2">
            <Label htmlFor="checkout-cardholderName">
              Cardholder Name <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="cardholderName"
              render={({ field }) => (
                <Input
                  id="checkout-cardholderName"
                  autoComplete="cc-name"
                  placeholder="NGUYEN VAN A"
                  className="uppercase"
                  startAdornment={<User aria-hidden="true" />}
                  value={field.value}
                  aria-invalid={errors.cardholderName ? true : undefined}
                  aria-describedby={errors.cardholderName ? 'checkout-cardholderName-error' : undefined}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
            <FieldError id="checkout-cardholderName-error" message={errors.cardholderName?.message} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="checkout-cardExpiration">
              Expiration Date <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="cardExpiration"
              render={({ field }) => (
                <Input
                  id="checkout-cardExpiration"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM / YY"
                  startAdornment={<Calendar aria-hidden="true" />}
                  value={field.value}
                  aria-invalid={errors.cardExpiration ? true : undefined}
                  aria-describedby={errors.cardExpiration ? 'checkout-cardExpiration-error' : undefined}
                  onChange={(event) => field.onChange(formatCardExpiration(event.target.value))}
                  onBlur={field.onBlur}
                />
              )}
            />
            <FieldError id="checkout-cardExpiration-error" message={errors.cardExpiration?.message} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="checkout-cardCvv">
              CVV/CVC <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="cardCvv"
              render={({ field }) => (
                <Input
                  id="checkout-cardCvv"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="123"
                  maxLength={4}
                  startAdornment={<Lock aria-hidden="true" />}
                  value={field.value}
                  aria-invalid={errors.cardCvv ? true : undefined}
                  aria-describedby={errors.cardCvv ? 'checkout-cardCvv-error' : undefined}
                  onChange={(event) => field.onChange(event.target.value.replace(/\D/g, '').slice(0, 4))}
                  onBlur={field.onBlur}
                />
              )}
            />
            <FieldError id="checkout-cardCvv-error" message={errors.cardCvv?.message} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-surface p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary-tint text-primary">
            <ShieldCheck className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-ink">OTP Verification</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Enter the OTP code sent to your phone number {phone || 'on file'}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <Label htmlFor="checkout-otpCode">
            OTP Code <span className="text-destructive">*</span>
          </Label>
          <Controller
            control={control}
            name="otpCode"
            render={({ field }) => (
              <Input
                id="checkout-otpCode"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter 6-digit code"
                startAdornment={<Smartphone aria-hidden="true" />}
                endAdornment={
                  <button
                    type="button"
                    className={cn(
                      'text-xs font-semibold whitespace-nowrap',
                      canResend ? 'text-primary hover:text-primary-strong' : 'text-muted-foreground',
                    )}
                    disabled={!canResend}
                    onClick={onResend}
                  >
                    {canResend ? 'Resend OTP' : `Resend OTP (${formatOtpCountdown(otpSeconds)})`}
                  </button>
                }
                value={field.value}
                aria-invalid={errors.otpCode ? true : undefined}
                aria-describedby={errors.otpCode ? 'checkout-otpCode-error' : undefined}
                onChange={(event) => field.onChange(formatOtpCode(event.target.value))}
                onBlur={field.onBlur}
              />
            )}
          />
          <FieldError id="checkout-otpCode-error" message={errors.otpCode?.message} />
        </div>
      </section>
    </>
  );
}
