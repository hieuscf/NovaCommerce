'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Lock, Pencil, ShieldCheck, Trash2, Truck } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Separator } from '@novacommerce/ui/components/separator';
import { CheckoutPaymentArt } from '@/components/commerce/checkout/checkout-payment-art';
import { QuantitySelector } from '@/components/commerce/quantity-selector';
import {
  formatCartMoney,
  lineTotal,
  type CartLineViewModel,
  type CartSummaryViewModel,
} from '@/lib/view-models/cart';
import { productHref } from '@/lib/view-models/product';
import type { CheckoutStage } from '@/lib/view-models/checkout';

export function CheckoutSummary({
  lines,
  summary,
  stage,
  submitting,
  onQuantityChange,
  onRemove,
  onPrimaryAction,
}: {
  lines: readonly CartLineViewModel[];
  summary: CartSummaryViewModel;
  stage: CheckoutStage;
  submitting: boolean;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onPrimaryAction: () => void;
}) {
  const isPayment = stage === 'payment';
  const primaryLabel =
    stage === 'details' ? 'Proceed to Payment' : stage === 'payment' ? 'Continue to Review' : 'Place order';
  const shippingLabel = summary.freeShippingUnlocked ? 'Free' : 'Calculated at checkout';

  return (
    <aside className="rounded-[28px] border border-border/70 bg-surface p-5 shadow-card-soft sm:p-6 lg:sticky lg:top-24">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">Order Summary</h2>
        {isPayment ? (
          <Link
            href="/cart"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-strong focus-ring"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            Edit Cart
          </Link>
        ) : (
          <p className="text-xs text-muted-foreground">
            {summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'}
          </p>
        )}
      </div>

      <ul className="mt-5 divide-y divide-border/70">
        {lines.map((line) =>
          isPayment ? (
            <PaymentLine key={line.id} line={line} />
          ) : (
            <EditableLine
              key={line.id}
              line={line}
              onQuantityChange={onQuantityChange}
              onRemove={onRemove}
            />
          ),
        )}
      </ul>

      <Separator className="my-4" />

      <dl className="space-y-3 text-sm" aria-live="polite">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">
            Subtotal ({summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'})
          </dt>
          <dd className="font-medium text-foreground tabular-nums">
            {formatCartMoney(summary.subtotal, summary.currency)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd className="font-medium text-success">{shippingLabel}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Tax ({summary.taxRatePercent}%)</dt>
          <dd className="font-medium text-foreground tabular-nums">
            {formatCartMoney(summary.tax, summary.currency)}
          </dd>
        </div>
      </dl>

      <Separator className="my-4" />

      <div className="flex items-center justify-between gap-4">
        <p className="text-base font-semibold text-ink">Total</p>
        <p className="text-xl font-extrabold text-ink tabular-nums">
          {formatCartMoney(summary.total, summary.currency)}
        </p>
      </div>

      {isPayment ? (
        <PaymentAsideNotes />
      ) : (
        <>
          <Button
            type="button"
            variant="primary-gradient"
            className="mt-6 h-12 w-full rounded-xl"
            loading={submitting && stage === 'review'}
            loadingLabel="Placing order"
            onClick={onPrimaryAction}
          >
            <Lock className="size-4" aria-hidden="true" />
            {primaryLabel}
            {stage !== 'review' ? <span aria-hidden="true">→</span> : null}
          </Button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <Lock className="size-3.5" aria-hidden="true" />
            Your payment information is secure and encrypted
          </p>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-border/70 bg-surface-subtle px-3 py-2.5 text-xs text-muted-foreground">
            <Lock className="size-3.5 text-primary" aria-hidden="true" />
            <span>
              <span className="font-semibold text-ink">SSL Encrypted</span>
              <span className="block">Your information is safe and secure</span>
            </span>
          </div>
        </>
      )}
    </aside>
  );
}

function PaymentLine({ line }: { line: CartLineViewModel }) {
  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <Link
          href={productHref(line.slug)}
          className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-surface-subtle"
        >
          <Image src={line.imageUrl} alt="" fill sizes="56px" className="object-cover" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">
                <Link href={productHref(line.slug)} className="hover:text-primary focus-ring">
                  {line.name}
                </Link>
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {line.variantLabel.split(' · ').join(' - ')}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-ink tabular-nums">
                {formatCartMoney(line.unitPrice, line.currency)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">x {line.quantity}</p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

function EditableLine({
  line,
  onQuantityChange,
  onRemove,
}: {
  line: CartLineViewModel;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <Link
          href={productHref(line.slug)}
          className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-surface-subtle"
        >
          <Image src={line.imageUrl} alt="" fill sizes="56px" className="object-cover" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p id={`${line.id}-name`} className="truncate text-sm font-semibold text-ink">
                <Link href={productHref(line.slug)} className="hover:text-primary focus-ring">
                  {line.name}
                </Link>
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{line.variantLabel}</p>
              <p className="mt-1 text-sm font-semibold text-foreground tabular-nums">
                {formatCartMoney(line.unitPrice, line.currency)}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(line.id)}
              aria-label={`Remove ${line.name} from order`}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <QuantitySelector
              id={`${line.id}-qty`}
              value={line.quantity}
              onChange={(quantity) => onQuantityChange(line.id, quantity)}
              className="h-10 rounded-pill"
              labelledBy={`${line.id}-name`}
            />
            <p className="text-sm font-semibold text-ink tabular-nums">
              {formatCartMoney(lineTotal(line), line.currency)}
            </p>
          </div>
        </div>
      </div>
    </li>
  );
}

function PaymentAsideNotes() {
  return (
    <div className="mt-5 space-y-3">
      <div className="flex items-center gap-3 rounded-2xl border border-primary/15 bg-primary-tint/50 px-4 py-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-surface text-primary shadow-sm">
          <Truck className="size-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink">Free Shipping</span>
          <span className="block text-xs text-muted-foreground">On orders over $50</span>
        </span>
        <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary-tint/50 px-4 py-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-surface text-primary shadow-sm">
          <ShieldCheck className="size-4" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-ink">Your payment information is secure</span>
          <span className="block text-xs text-muted-foreground">
            We use industry-standard encryption to protect your data.
          </span>
        </span>
      </div>
      <CheckoutPaymentArt />
    </div>
  );
}
