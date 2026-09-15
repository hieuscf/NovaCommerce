import Image from 'next/image';
import Link from 'next/link';
import { Check, MapPin, Package, Truck } from 'lucide-react';
import { Badge } from '@novacommerce/ui/components/badge';
import { Container } from '@novacommerce/ui/components/container';
import { ShopBreadcrumb } from '@/components/commerce/listing/shop-breadcrumb';
import {
  OrderPreviewActions,
  OrderTrackPackageButton,
} from '@/components/commerce/orders/order-preview-actions';
import { OrderStatusBadge } from '@/components/commerce/orders/order-status-badge';
import { cn } from '@/lib/utils';
import {
  formatOrderMoney,
  formatOrderNumber,
  itemCountLabel,
  paymentMaskedLabel,
  type OrderDetailViewModel,
  type OrderTimelineStepViewModel,
} from '@/lib/view-models/order';
import { productHref } from '@/lib/view-models/product';

export function OrderDetailPage({ detail }: { detail: OrderDetailViewModel }) {
  return (
    <div className="bg-page-canvas min-h-svh">
      <Container size="wide" className="py-8 lg:py-10">
        <ShopBreadcrumb crumbs={detail.crumbs} />
        <header className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="sr-only">Order {formatOrderNumber(detail.orderNumber)}</h1>
            <p className="text-sm text-muted-foreground">Placed on {detail.placedAtLabel}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={detail.status} className="h-10 px-3 text-xs" />
            <OrderPreviewActions />
          </div>
        </header>

        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 space-y-5">
            <OrderTimeline steps={detail.timeline} />
            <OrderItemsCard detail={detail} />
          </div>
          <aside className="space-y-5">
            <ShippingInformationCard detail={detail} />
            <ShippingAddressCard detail={detail} />
            <PaymentInformationCard detail={detail} />
            <OrderSummaryCard detail={detail} />
          </aside>
        </div>
      </Container>
    </div>
  );
}

function OrderCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/70 bg-surface p-5 shadow-card-soft">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-bold text-ink">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function OrderTimeline({ steps }: { steps: readonly OrderTimelineStepViewModel[] }) {
  return (
    <OrderCard title="Order Status">
      <ol className="relative space-y-5">
        {steps.map((step, index) => {
          const last = index === steps.length - 1;
          return (
            <li key={step.id} className="relative flex gap-3">
              {!last ? (
                <span
                  className={cn(
                    'absolute top-7 left-[11px] h-[calc(100%-4px)] w-px',
                    step.state === 'complete' ? 'bg-success/50' : 'bg-border',
                  )}
                  aria-hidden="true"
                />
              ) : null}
              <TimelineDot state={step.state} />
              <div className="min-w-0 pt-0.5">
                <p
                  className={cn(
                    'text-sm font-semibold',
                    step.state === 'pending' ? 'text-muted-foreground' : 'text-ink',
                  )}
                >
                  {step.label}
                </p>
                {step.atLabel ? (
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">{step.atLabel}</p>
                ) : null}
                {step.note ? (
                  <p
                    className={cn(
                      'mt-0.5 text-[11.5px]',
                      step.state === 'current' ? 'text-primary' : 'text-muted-foreground',
                    )}
                  >
                    {step.note}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </OrderCard>
  );
}

function TimelineDot({ state }: { state: OrderTimelineStepViewModel['state'] }) {
  if (state === 'complete') {
    return (
      <span className="relative z-[1] grid size-6 shrink-0 place-items-center rounded-full bg-success text-white">
        <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
      </span>
    );
  }

  if (state === 'current') {
    return (
      <span className="relative z-[1] grid size-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
        <Truck className="size-3.5" aria-hidden="true" />
      </span>
    );
  }

  return <span className="relative z-[1] size-6 shrink-0 rounded-full border-2 border-border bg-surface" />;
}

function OrderItemsCard({ detail }: { detail: OrderDetailViewModel }) {
  return (
    <OrderCard
      title={`Order Items (${detail.items.length})`}
      action={
        <span className="text-[11.5px] font-medium text-muted-foreground">
          {itemCountLabel(detail.summary.itemCount)}
        </span>
      }
    >
      <ul className="divide-y divide-border/70">
        {detail.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <Link
              href={productHref(item.slug)}
              className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-surface-subtle"
            >
              <Image src={item.imageUrl} alt="" fill sizes="56px" className="object-cover" />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={productHref(item.slug)}
                className="truncate text-sm font-semibold text-ink hover:text-primary"
              >
                {item.name}
              </Link>
              <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">{item.variantLabel}</p>
            </div>
            <p className="shrink-0 text-sm font-bold tabular-nums text-ink">
              {formatOrderMoney(item.lineTotal, item.currency)}
            </p>
          </li>
        ))}
      </ul>
    </OrderCard>
  );
}

function ShippingInformationCard({ detail }: { detail: OrderDetailViewModel }) {
  return (
    <OrderCard
      title="Shipping Information"
      action={detail.shipping.trackingNumber ? <OrderTrackPackageButton /> : null}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary-tint text-primary">
          <Package className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 text-sm">
          <p className="font-semibold text-ink">{detail.shipping.methodLabel}</p>
          {detail.shipping.trackingNumber ? (
            <p className="mt-1 text-[12px] text-muted-foreground">
              Tracking Number:{' '}
              <span className="font-medium text-foreground">{detail.shipping.trackingNumber}</span>
            </p>
          ) : (
            <p className="mt-1 text-[12px] text-muted-foreground">Tracking will appear after the order ships.</p>
          )}
          {detail.shipping.carrier ? (
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Carrier: <span className="font-medium text-foreground">{detail.shipping.carrier}</span>
            </p>
          ) : null}
        </div>
      </div>
    </OrderCard>
  );
}

function ShippingAddressCard({ detail }: { detail: OrderDetailViewModel }) {
  return (
    <OrderCard title="Shipping Address">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary-tint text-primary">
          <MapPin className="size-4" aria-hidden="true" />
        </span>
        <address className="min-w-0 text-sm not-italic leading-relaxed text-copy">
          <p className="font-semibold text-ink">{detail.address.recipient}</p>
          <p className="mt-1">{detail.address.line1}</p>
          <p>{detail.address.line2}</p>
          <p className="mt-1 text-muted-foreground">{detail.address.phone}</p>
        </address>
      </div>
    </OrderCard>
  );
}

function PaymentInformationCard({ detail }: { detail: OrderDetailViewModel }) {
  return (
    <OrderCard
      title="Payment Information"
      action={
        detail.payment.status === 'paid' ? (
          <Badge variant="success">Paid</Badge>
        ) : (
          <Badge variant="warning">Pending</Badge>
        )
      }
    >
      <p className="text-sm font-semibold text-ink">{paymentMaskedLabel(detail.payment)}</p>
      <p className="mt-1 text-[12px] text-muted-foreground">{detail.payment.paidAtLabel}</p>
    </OrderCard>
  );
}

function OrderSummaryCard({ detail }: { detail: OrderDetailViewModel }) {
  const { summary } = detail;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-surface p-5 shadow-card-soft">
      <TrophyArt />
      <h2 className="relative text-[15px] font-bold text-ink">Order Summary</h2>
      <dl className="relative mt-4 space-y-2.5 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Subtotal ({itemCountLabel(summary.itemCount)})</dt>
          <dd className="font-medium tabular-nums text-ink">
            {formatOrderMoney(summary.subtotal, summary.currency)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd className="font-medium text-success">{summary.shipping === 0 ? 'Free' : formatOrderMoney(summary.shipping, summary.currency)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Tax ({summary.taxRatePercent}%)</dt>
          <dd className="font-medium tabular-nums text-ink">
            {formatOrderMoney(summary.tax, summary.currency)}
          </dd>
        </div>
        <div className="flex items-end justify-between gap-3 border-t border-border/70 pt-3">
          <dt className="text-base font-bold text-ink">Total</dt>
          <dd className="text-xl font-extrabold tabular-nums text-primary">
            {formatOrderMoney(summary.total, summary.currency)}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function TrophyArt() {
  return (
    <div className="pointer-events-none absolute -right-4 -bottom-6 size-28 opacity-80" aria-hidden="true">
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[#fde68a]/80 to-[#c4b5fd]/50 blur-md" />
      <span className="absolute top-6 right-8 h-10 w-8 rounded-b-full bg-gradient-to-b from-[#fbbf24] to-[#d97706]" />
      <span className="absolute top-4 right-7 h-3 w-10 rounded-full bg-[#f59e0b]" />
      <span className="absolute top-16 right-6 h-2 w-12 rounded-full bg-[#e2e8f0]" />
      <span className="absolute top-[4.5rem] right-8 h-3 w-8 rounded-sm bg-[#cbd5e1]" />
    </div>
  );
}
