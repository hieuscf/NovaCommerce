import Link from 'next/link';
import { BadgeCheck, Check, Star, Store } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import type { ProductDetailViewModel } from '@/lib/view-models/product-detail';

function sidebarFeatures(detail: ProductDetailViewModel) {
  const extras = detail.features.slice(3);
  return extras.length >= 3 ? extras : detail.features;
}

export function ProductSidebar({ detail }: { detail: ProductDetailViewModel }) {
  const { seller } = detail;
  const features = sidebarFeatures(detail);

  return (
    <aside className="flex flex-col gap-4">
      <section className="rounded-[1.75rem] border border-border/70 bg-surface p-5 shadow-card-soft">
        <h2 className="text-base font-semibold text-ink">Key Features</h2>
        <ul className="mt-4 space-y-3">
          {features.map((feature) => (
            <li key={feature.title} className="flex items-start gap-2.5 text-sm text-copy">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary-tint text-primary">
                <Check className="size-3" strokeWidth={2.5} aria-hidden="true" />
              </span>
              <span>{feature.title}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[1.75rem] border border-border/70 bg-surface p-5 shadow-card-soft">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-gradient-hero text-primary-foreground">
              <Store className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                Sold by {seller.name}
                {seller.official ? (
                  <BadgeCheck className="size-4 text-primary" aria-label="Official store" />
                ) : null}
              </p>
              {seller.official ? (
                <p className="text-[11px] text-muted-foreground">Official Store</p>
              ) : null}
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-pill">
            <Link href={seller.href}>Visit Store</Link>
          </Button>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-sm">
          <Star className="size-3.5 fill-current text-warning" aria-hidden="true" />
          <span className="font-semibold text-foreground">{seller.rating.toFixed(1)}</span>
          <span className="text-muted-foreground">({seller.reviewLabel})</span>
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {seller.badges.map((badge) => (
            <li
              key={badge}
              className="rounded-xl bg-surface-subtle px-3 py-2 text-center text-[11px] font-medium text-copy"
            >
              {badge}
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
