import type { RefObject } from 'react';
import type { FieldErrors } from 'react-hook-form';
import type { CheckoutFormValues } from '@/lib/validation/checkout-schemas';

const FIELD_LABELS: Partial<Record<keyof CheckoutFormValues, string>> = {
  fullName: 'Full name',
  email: 'Email address',
  phone: 'Phone number',
  addressLine1: 'Address line 1',
  addressLine2: 'Address line 2',
  city: 'City',
  state: 'State or province',
  postalCode: 'Postal code',
  country: 'Country',
  paymentMethod: 'Payment method',
  cardNumber: 'Card number',
  cardholderName: 'Cardholder name',
  cardExpiration: 'Expiration date',
  cardCvv: 'CVV',
  otpCode: 'OTP code',
};

export function CheckoutErrorSummary({
  errors,
  summaryRef,
}: {
  errors: FieldErrors<CheckoutFormValues>;
  summaryRef: RefObject<HTMLDivElement | null>;
}) {
  const entries = (Object.keys(FIELD_LABELS) as (keyof CheckoutFormValues)[]).flatMap((name) => {
    const error = errors[name];
    return error?.message ? [{ name, message: String(error.message) }] : [];
  });

  if (entries.length === 0) {
    return null;
  }

  return (
    <div
      ref={summaryRef}
      tabIndex={-1}
      role="alert"
      aria-labelledby="checkout-error-title"
      className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-4 focus-ring"
    >
      <h2 id="checkout-error-title" className="text-sm font-semibold text-ink">
        There is a problem
      </h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        {entries.map((entry) => (
          <li key={entry.name}>
            <a href={`#checkout-${entry.name}`} className="text-destructive hover:underline">
              {FIELD_LABELS[entry.name]}: {entry.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
