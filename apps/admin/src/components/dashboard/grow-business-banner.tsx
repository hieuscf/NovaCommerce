import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';

export function GrowBusinessBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-lg shadow-indigo-500/20">
      <div
        className="pointer-events-none absolute -top-10 -right-6 size-40 rounded-full bg-white/10 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-12 left-10 size-36 rounded-full bg-sky-400/20 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[220px]">
        <p className="text-lg font-bold tracking-tight">Grow Your Business</p>
        <p className="mt-1.5 text-sm text-white/80">
          Unlock deeper insights and optimize your store performance.
        </p>
        <Button
          asChild
          size="sm"
          className="mt-4 rounded-xl bg-white text-indigo-700 hover:bg-white/90"
        >
          <Link href="/analytics">
            Explore Analytics
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <div className="pointer-events-none absolute right-3 bottom-3 flex items-end gap-2 opacity-90" aria-hidden="true">
        <span className="mb-4 size-10 rounded-xl bg-white/20 shadow-lg backdrop-blur-sm" />
        <span className="size-14 rounded-2xl bg-gradient-to-br from-white/30 to-white/5 shadow-xl backdrop-blur-sm ring-1 ring-white/30" />
        <span className="mb-2 size-8 rounded-full bg-amber-300/80 shadow-md" />
      </div>
    </div>
  );
}
