import Link from 'next/link';
import { ArrowLeft, Truck } from 'lucide-react';
import { CartItemRow } from '@/components/commerce/cart/cart-item-row';
import { formatCartMoney, type CartLineViewModel, type CartSummaryViewModel } from '@/lib/view-models/cart';

export function CartItemsPanel({
  lines,
  summary,
  onSelect,
  onQuantityChange,
  onRemove,
}: {
  lines: readonly CartLineViewModel[];
  summary: CartSummaryViewModel;
  onSelect: (id: string, selected: boolean) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}) {
  const remaining = summary.amountToFreeShipping;
  const progress = summary.freeShippingUnlocked
    ? 100
    : Math.min(
        100,
        Math.round(
          ((summary.freeShippingThreshold - remaining) / summary.freeShippingThreshold) * 100,
        ),
      );

  return (
    <section
      aria-labelledby="cart-items-heading"
      className="rounded-2xl border border-border/70 bg-surface p-5 shadow-card-soft sm:p-6"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 id="cart-items-heading" className="text-base font-semibold text-ink">
          {summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'} in your cart
        </h2>
        <Link
          href="/shop"
          className="inline-flex h-11 items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-strong focus-ring"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Continue Shopping
        </Link>
      </div>

      <ul>
        {lines.map((line) => (
          <CartItemRow
            key={line.id}
            line={line}
            onSelect={(selected) => onSelect(line.id, selected)}
            onQuantityChange={(quantity) => onQuantityChange(line.id, quantity)}
            onRemove={() => onRemove(line.id)}
          />
        ))}
      </ul>

      <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-primary-tint/70 px-4 py-3 sm:flex-row sm:items-center sm:gap-5">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface text-primary shadow-sm">
            <Truck className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">
              Free shipping on orders over {formatCartMoney(summary.freeShippingThreshold, summary.currency)}
            </p>
            <p className="text-xs text-muted-foreground">
              {summary.freeShippingUnlocked
                ? 'You have unlocked free shipping.'
                : `You're ${formatCartMoney(remaining, summary.currency)} away from free shipping.`}
            </p>
          </div>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-surface sm:max-w-[180px]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label="Progress toward free shipping"
        >
          <span className="block h-full rounded-full bg-gradient-cta" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </section>
  );
}
