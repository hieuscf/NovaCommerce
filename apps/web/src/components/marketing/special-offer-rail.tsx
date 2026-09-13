import Link from 'next/link';
import { ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { Badge } from '@novacommerce/ui/components/badge';
import { Button } from '@novacommerce/ui/components/button';

export function SpecialOfferRail() {
  return (
    <aside className="relative flex min-h-[340px] flex-col overflow-hidden rounded-2xl border border-white/70 bg-offer-rail p-5 shadow-rail">
      <Badge variant="secondary" className="w-fit gap-1.5 bg-surface px-2.5 py-1 text-[10px] text-primary">
        <Sparkles className="size-3" />
        Special Offer
      </Badge>
      <h2 className="mt-4 text-[26px] font-extrabold leading-tight tracking-tight text-ink">
        Up to 50% Off
      </h2>
      <p className="mt-1 text-sm font-semibold text-copy">Premium Tech Collection</p>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Upgrade your tech with the latest gadgets and accessories.
      </p>
      <Button asChild variant="dark" className="mt-5 h-10 w-fit rounded-pill px-4 text-xs">
        <Link href="/shop?sale=true">
          Shop Collection
          <ArrowRight className="size-3.5" />
        </Link>
      </Button>

      <div className="relative mt-auto pt-8" aria-hidden>
        <div
          className="mx-auto h-[92px] w-[190px] rounded-t-[10px] p-1.5"
          style={{ backgroundImage: 'linear-gradient(160deg, #6b7280 0%, #374151 100%)' }}
        >
          <div
            className="h-full w-full rounded-md"
            style={{
              backgroundImage:
                'conic-gradient(from 160deg at 40% 60%, #14b8a6, #6366f1, #a855f7, #14b8a6)',
            }}
          />
        </div>
        <div
          className="mx-auto h-2 w-[226px] rounded-b-lg"
          style={{ backgroundImage: 'linear-gradient(180deg, #9ca3af 0%, #4b5563 100%)' }}
        />
      </div>

      <Button
        asChild
        variant="secondary"
        size="icon-sm"
        className="absolute right-4 bottom-4 size-8 rounded-full bg-surface shadow-sm"
      >
        <Link href="/shop?sale=true" aria-label="Next offer">
          <ChevronRight className="size-4" />
        </Link>
      </Button>
    </aside>
  );
}
