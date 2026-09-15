import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Container } from '@novacommerce/ui/components/container';
import { CheckoutTrustBar } from '@/components/commerce/checkout/checkout-trust-bar';
import { cn } from '@/lib/utils';
import {
  formatOrderMoney,
  formatOrderNumber,
  type OrderConfirmedViewModel,
  type OrderTimelineStepViewModel,
} from '@/lib/view-models/order';

export function OrderConfirmedPage({ confirmation }: { confirmation: OrderConfirmedViewModel }) {
  return (
    <div className="bg-page-canvas min-h-svh">
      <section className="relative overflow-hidden pt-8 pb-6 lg:pt-12 lg:pb-10">
        <ConfirmedAmbient />
        <Container size="wide" className="relative">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <OrderConfirmedArt />
            <ConfirmationCard confirmation={confirmation} />
          </div>
        </Container>
      </section>
      <Container size="wide" className="pb-10">
        <CheckoutTrustBar />
      </Container>
    </div>
  );
}

function ConfirmationCard({ confirmation }: { confirmation: OrderConfirmedViewModel }) {
  return (
    <article className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-premium backdrop-blur-sm sm:p-8">
      <div className="text-center">
        <span className="relative mx-auto grid size-16 place-items-center">
          <span className="absolute inset-0 rounded-full bg-success/15" aria-hidden="true" />
          <span className="grid size-12 place-items-center rounded-full bg-success text-white shadow-md">
            <Check className="size-7" strokeWidth={3} aria-hidden="true" />
          </span>
          <Sparkles />
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink">Order Confirmed!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-border/70 bg-surface-subtle/80 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-ink">
              Order {formatOrderNumber(confirmation.orderNumber)}
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">Placed on {confirmation.placedAtLabel}</p>
          </div>
          <Link
            href={confirmation.detailHref}
            className="text-[12.5px] font-semibold text-primary hover:underline"
          >
            View Order Details
          </Link>
        </div>

        <ol className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {confirmation.progress.map((step, index) => (
            <ProgressStep key={step.id} step={step} last={index === confirmation.progress.length - 1} />
          ))}
        </ol>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-surface px-4 py-4">
          <h2 className="text-[13px] font-bold text-ink">Order Information</h2>
          <dl className="mt-3 space-y-2 text-[12.5px]">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Total Amount</dt>
              <dd className="font-bold tabular-nums text-primary">
                {formatOrderMoney(confirmation.summary.total, confirmation.summary.currency)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Payment Method</dt>
              <dd className="font-medium text-ink">{confirmation.paymentLabel}</dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="text-muted-foreground">Shipping Method</dt>
              <dd className="text-right font-medium text-ink">{confirmation.shippingMethodLabel}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-2xl border border-border/70 bg-surface px-4 py-4">
          <h2 className="text-[13px] font-bold text-ink">Shipping Address</h2>
          <address className="mt-3 text-[12.5px] leading-relaxed text-copy not-italic">
            <p className="font-semibold text-ink">{confirmation.address.recipient}</p>
            <p className="mt-1">{confirmation.address.line1}</p>
            <p>{confirmation.address.line2}</p>
          </address>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="primary-gradient" className="h-12 flex-1 rounded-pill">
          <Link href="/shop">
            Continue Shopping
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild variant="secondary" className="h-12 flex-1 rounded-pill">
          <Link href="/orders">View My Orders</Link>
        </Button>
      </div>
    </article>
  );
}

function ProgressStep({
  step,
  last,
}: {
  step: OrderTimelineStepViewModel;
  last: boolean;
}) {
  return (
    <li className="relative flex flex-col items-center text-center">
      {!last ? (
        <span
          className={cn(
            'absolute top-4 left-[calc(50%+18px)] hidden h-px w-[calc(100%-12px)] sm:block',
            step.state === 'complete' ? 'bg-success/50' : 'bg-border',
          )}
          aria-hidden="true"
        />
      ) : null}
      <span
        className={cn(
          'grid size-8 place-items-center rounded-full border-2',
          step.state === 'complete' && 'border-success bg-success text-white',
          step.state === 'current' && 'border-primary bg-primary-tint text-primary',
          step.state === 'pending' && 'border-border bg-surface text-muted-foreground',
        )}
      >
        {step.state === 'complete' ? <Check className="size-4" strokeWidth={3} aria-hidden="true" /> : null}
      </span>
      <p
        className={cn(
          'mt-2 text-[12px] font-semibold',
          step.state === 'pending' ? 'text-muted-foreground' : 'text-ink',
        )}
      >
        {step.label}
      </p>
      {step.note ? <p className="text-[10.5px] text-muted-foreground">{step.note}</p> : null}
    </li>
  );
}

function Sparkles() {
  return (
    <span className="pointer-events-none absolute inset-0" aria-hidden="true">
      <span className="absolute -top-1 right-0 size-1.5 rounded-full bg-success" />
      <span className="absolute top-1 -right-3 size-1 rounded-full bg-success/70" />
      <span className="absolute -bottom-0.5 left-0 size-1.5 rounded-full bg-success/80" />
      <span className="absolute top-0 -left-2 size-1 rounded-full bg-cyan-400" />
    </span>
  );
}

function ConfirmedAmbient() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <span className="absolute top-[8%] left-[6%] size-24 rounded-full bg-[#c4b5fd]/40 blur-md" />
      <span className="absolute top-[18%] left-[22%] size-10 rounded-full bg-[#93c5fd]/50" />
      <span className="absolute right-[8%] bottom-[12%] size-20 rounded-full bg-[#ddd6fe]/50 blur-sm" />
    </div>
  );
}

function OrderConfirmedArt() {
  return (
    <div className="relative mx-auto hidden h-[420px] w-full max-w-[460px] lg:block" aria-hidden="true">
      <div
        className="absolute top-6 left-1/2 size-[280px] -translate-x-1/2 rounded-full"
        style={{
          backgroundImage:
            'conic-gradient(from 210deg, rgb(165 180 252 / 0.55), rgb(196 181 253 / 0.55), rgb(125 211 252 / 0.4), rgb(165 180 252 / 0.55))',
        }}
      />
      <div
        className="absolute top-16 left-[72px] h-[210px] w-[118px] rounded-[22px]"
        style={{
          backgroundImage: 'linear-gradient(150deg, #8b93a0 0%, #4b535e 50%, #2b3138 100%)',
          boxShadow: '0 24px 40px -18px rgba(15,23,42,0.55)',
        }}
      >
        <div className="absolute top-3 left-3 grid grid-cols-2 gap-1.5">
          {Array.from({ length: 4 }).map((_, index) => (
            <span
              key={index}
              className="block size-[22px] rounded-full"
              style={{ backgroundImage: 'linear-gradient(160deg, #1e232a, #0b0e12)' }}
            />
          ))}
        </div>
      </div>
      <div
        className="absolute top-[92px] right-[78px] h-[150px] w-[170px] rounded-t-[10px] p-[6px]"
        style={{ backgroundImage: 'linear-gradient(160deg, #9aa1ab, #3b424b)' }}
      >
        <div
          className="h-full w-full rounded-[4px]"
          style={{ backgroundImage: 'linear-gradient(160deg, #1e293b, #0b1226)' }}
        />
      </div>
      <div
        className="absolute top-[238px] right-[62px] h-[8px] w-[200px] rounded-b-[8px]"
        style={{ backgroundImage: 'linear-gradient(180deg, #cbd2da, #5b6371)' }}
      />
      <div
        className="absolute top-[168px] left-[188px] size-[92px] rounded-full"
        style={{ border: '18px solid #ded8cc', boxShadow: '0 18px 28px -14px rgba(15,23,42,0.4)' }}
      />
      <div
        className="absolute top-[214px] left-[214px] h-[54px] w-[42px] rounded-[18px]"
        style={{ backgroundImage: 'linear-gradient(150deg, #f2ede3, #cdc5b6)' }}
      />
      <div
        className="absolute top-[248px] left-[86px] h-[72px] w-[58px] rounded-[16px]"
        style={{ backgroundImage: 'linear-gradient(150deg, #333a42, #10141a)' }}
      >
        <div
          className="absolute inset-[6px] rounded-[10px]"
          style={{ backgroundImage: 'linear-gradient(150deg, #5b3fa8, #0b1026)' }}
        />
      </div>
      <div
        className="absolute top-[58px] left-[42px] h-[88px] w-[70px] rounded-[18px] bg-white"
        style={{ boxShadow: '0 18px 28px -16px rgba(15,23,42,0.35)' }}
      />
      <div
        className="absolute top-[70px] left-[28px] h-[70px] w-[56px] rounded-[16px] bg-[#eef2ff]"
        style={{ boxShadow: '0 14px 22px -14px rgba(15,23,42,0.3)' }}
      />
      <div className="absolute bottom-6 left-1/2 h-[22px] w-[300px] -translate-x-1/2 rounded-[50%] bg-white/80 blur-[2px]" />
    </div>
  );
}
