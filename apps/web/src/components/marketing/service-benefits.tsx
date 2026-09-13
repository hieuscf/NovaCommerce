import { Headphones, RefreshCw, Shield, Truck } from 'lucide-react';
import { Container } from '@novacommerce/ui/components/container';
import { serviceBenefits } from '@/lib/mock-data/homepage';
import { cn } from '@/lib/utils';

const iconMap = {
  truck: Truck,
  shield: Shield,
  refresh: RefreshCw,
  headphones: Headphones,
};

export function ServiceBenefits({ embedded = false }: { embedded?: boolean }) {
  const body = (
    <div
      className={cn(
        'grid grid-cols-2 gap-6 lg:grid-cols-4',
        embedded
          ? 'rounded-[20px] border border-border/70 bg-surface px-6 py-6 shadow-sm'
          : 'gap-8',
      )}
    >
      {serviceBenefits.map((benefit) => {
        const Icon = iconMap[benefit.icon];
        return (
          <div key={benefit.title} className="flex items-center gap-3.5">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary-tint text-primary">
              <Icon className="size-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{benefit.title}</p>
              <p className="truncate text-xs text-muted-foreground">{benefit.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (embedded) {
    return <section aria-label="Store guarantees">{body}</section>;
  }

  return (
    <section className="border-y border-border bg-surface">
      <Container className="py-8 lg:py-10">{body}</Container>
    </section>
  );
}
