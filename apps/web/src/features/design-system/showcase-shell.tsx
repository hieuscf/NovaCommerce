import { Container } from '@novacommerce/ui/components/container';
import { NovaCommerceLogo } from '@novacommerce/ui/components/nova-commerce-logo';
import { cn } from '@/lib/utils';

export interface ShowcaseSectionProps {
  id: string;
  index: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function ShowcaseSection({
  id,
  index,
  title,
  description,
  children,
}: ShowcaseSectionProps) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border py-12 first:border-t-0">
      <p className="text-overline text-primary">Section {index}</p>
      <h2 className="mt-2 text-h3">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-8">{children}</div>
    </section>
  );
}

/** Labelled example slot, so every specimen reads the same way. */
export function Specimen({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3">
      <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <div className={cn('flex flex-wrap items-center gap-3', className)}>{children}</div>
    </div>
  );
}

export function SpecimenGrid({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn('grid gap-8 sm:grid-cols-2', className)}>{children}</div>;
}

export function ShowcaseShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="glass sticky top-0 z-40 border-b border-border">
        <Container className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <NovaCommerceLogo size={28} wordmarkClassName="text-base" />
            <span className="text-body-sm text-muted-foreground">Design System</span>
          </div>
          <span className="hidden text-caption text-muted-foreground sm:block">
            Internal reference · not a customer page
          </span>
        </Container>
      </header>
      <Container className="pb-24">{children}</Container>
    </div>
  );
}
