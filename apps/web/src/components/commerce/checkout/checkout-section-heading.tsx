import { cn } from '@/lib/utils';

export function CheckoutSectionHeading({
  step,
  title,
  description,
  className,
}: {
  step: number;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn('mb-5 flex items-start gap-3', className)}>
      <span
        className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-hero text-xs font-semibold text-primary-foreground shadow-cta"
        aria-hidden="true"
      >
        {step}
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
      </div>
    </div>
  );
}
