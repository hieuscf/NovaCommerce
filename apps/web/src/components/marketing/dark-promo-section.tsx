import Link from 'next/link';
import { ArrowRight, BadgeCheck, ShieldCheck, Tag, Truck } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Container } from '@novacommerce/ui/components/container';
import { cn } from '@/lib/utils';

const features = [
  { icon: BadgeCheck, title: 'Premium Quality', description: 'Curated from top brands' },
  { icon: Tag, title: 'Great Prices', description: 'Best deals every day' },
  { icon: Truck, title: 'Fast & Reliable Shipping', description: 'Get your order in no time' },
  { icon: ShieldCheck, title: 'Secure Shopping', description: 'Your data is always protected' },
];

export function DarkPromoSection({ embedded = false }: { embedded?: boolean }) {
  const body = (
    <div
      className={cn(
        'bg-panel-dark relative overflow-hidden',
        embedded
          ? 'flex h-full min-h-[740px] flex-col rounded-2xl p-5 shadow-[0_24px_50px_-30px_rgba(15,23,42,0.6)]'
          : 'rounded-3xl px-6 py-12 lg:px-12 lg:py-16',
      )}
    >
      <div className={cn('relative', embedded ? 'flex flex-1 flex-col' : 'grid gap-10 lg:grid-cols-2 lg:items-center')}>
        <div>
          <span className="inline-flex rounded-pill border border-white/15 bg-white/10 px-3 py-1 text-[10.5px] font-semibold text-white/90">
            Why Choose NovaCommerce?
          </span>
          <h2 className={cn('mt-4 font-extrabold tracking-tight text-white', embedded ? 'text-[22px] leading-tight' : 'text-h2')}>
            Your Trusted Online Shopping Partner
          </h2>
          <p className={cn('mt-3 leading-relaxed text-white/65', embedded ? 'text-xs' : 'max-w-lg text-base')}>
            We&apos;re committed to providing you with the best shopping experience, from quality
            products to exceptional service.
          </p>

          <ul className="mt-6 flex flex-col gap-4">
            {features.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-white">
                  <Icon className="size-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-[12.5px] font-semibold text-white">{title}</p>
                  <p className="truncate text-[11px] text-white/60">{description}</p>
                </div>
              </li>
            ))}
          </ul>

          <Button
            asChild
            variant="ghost"
            className="mt-7 h-9 rounded-pill border border-white/20 bg-white/10 px-4 text-xs text-white hover:bg-white/20 hover:text-white"
          >
            <Link href="/about">
              Learn more
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        <div className={cn('relative', embedded ? 'mt-auto h-[110px]' : 'mx-auto aspect-square w-full max-w-md')} aria-hidden>
          <div
            className={cn(
              'rounded-full',
              embedded ? 'absolute -right-0 -bottom-10 size-[150px]' : 'mx-auto size-48',
            )}
            style={{
              backgroundImage: 'radial-gradient(circle at 32% 28%, #ffffff 0%, #8f97a8 38%, #1f2637 100%)',
              boxShadow: '0 0 50px rgba(99,102,241,0.45)',
            }}
          />
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return <aside className="h-full">{body}</aside>;
  }

  return (
    <section className="py-14 lg:py-20">
      <Container>{body}</Container>
    </section>
  );
}
