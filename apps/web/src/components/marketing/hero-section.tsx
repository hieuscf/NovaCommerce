import Link from 'next/link';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { Badge } from '@novacommerce/ui/components/badge';
import { Button } from '@novacommerce/ui/components/button';
import { Container } from '@novacommerce/ui/components/container';
import { HeroArt } from '@/components/marketing/hero-art';
import { cn } from '@/lib/utils';

const trustAvatars = ['#c084fc', '#60a5fa', '#34d399'] as const;

export function HeroSection({ embedded = false }: { embedded?: boolean }) {
  const content = (
    <section
      className={cn(
        'relative overflow-hidden bg-hero-panel',
        embedded ? 'rounded-[20px] px-8 py-10 lg:px-10 lg:py-12' : 'bg-background',
      )}
    >
      {!embedded ? <div className="pointer-events-none absolute inset-0 bg-gradient-ambient" aria-hidden /> : null}

      <div className={cn('relative flex flex-col items-center gap-8 lg:flex-row lg:gap-6', !embedded && 'py-12 lg:py-20')}>
        <div className="min-w-0 flex-1 space-y-5">
          <Badge variant="secondary" className="gap-1.5 bg-surface/75 px-3 py-1 text-primary">
            <Sparkles className="size-3" />
            Better Tech, Brighter Tomorrow
          </Badge>

          <h1 className="mt-1 max-w-[460px] text-[clamp(2rem,4vw,2.625rem)] font-extrabold leading-[1.12] tracking-tight text-ink">
            Discover Amazing Products for a{' '}
            <span className="text-gradient-hero">Brighter</span> Tomorrow
          </h1>

          <p className="max-w-[380px] text-[13px] leading-[1.7] text-copy lg:text-sm">
            Shop the latest trends, top brands and unbeatable deals. Everything you need, all
            in one place.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button asChild variant="primary-gradient" className="h-11 rounded-pill px-6 shadow-cta">
              <Link href="/shop">
                Shop Now
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" className="h-11 rounded-pill bg-surface/85 px-6">
              <Link href="/shop?sale=true">Explore Deals</Link>
            </Button>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div className="flex">
              {trustAvatars.map((color, index) => (
                <span
                  key={color}
                  className="size-8 rounded-full border-2 border-white"
                  style={{
                    backgroundImage: `linear-gradient(150deg, ${color}, #1e293b)`,
                    marginLeft: index === 0 ? 0 : -10,
                  }}
                  aria-hidden
                />
              ))}
            </div>
            <div className="leading-tight">
              <p className="text-[13px] font-semibold text-ink">Trusted by 2M+ customers</p>
              <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <span className="flex text-warning" aria-hidden>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="size-3 fill-current" />
                  ))}
                </span>
                4.8 (12k+ reviews)
              </p>
            </div>
          </div>
        </div>

        <HeroArt />
      </div>
    </section>
  );

  if (embedded) {
    return content;
  }

  return <Container className="relative">{content}</Container>;
}
