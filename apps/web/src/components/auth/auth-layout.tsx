import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Badge } from '@novacommerce/ui/components/badge';
import { Button } from '@novacommerce/ui/components/button';
import { NovaCommerceLogo } from '@novacommerce/ui/components/nova-commerce-logo';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-ambient"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl motion-safe:animate-none"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-accent-cyan/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-1 flex-col lg:grid lg:grid-cols-2">
        <div className="flex flex-col px-5 py-6 sm:px-8 lg:px-12 lg:py-10">
          <div className="flex items-center justify-between gap-3">
            <Button
              asChild
              variant="ghost"
              className="w-fit self-start text-sm text-muted-foreground hover:text-foreground"
            >
              <Link href="/">
                <ArrowLeft className="mr-1.5 size-4" aria-hidden="true" />
                Back to shop
              </Link>
            </Button>
            <Link href="/" className="lg:hidden" aria-label="NovaCommerce">
              <NovaCommerceLogo size={28} wordmarkClassName="text-sm" />
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center py-8 sm:py-10 lg:py-16">
            <div className="w-full max-w-[440px]">{children}</div>
          </div>
        </div>

        <AuthVisualPanel />
      </div>
    </div>
  );
}

function AuthVisualPanel() {
  return (
    <div className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-accent-soft via-background-secondary to-background lg:flex">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent-cyan/10" />
      <div className="absolute top-1/4 left-1/4 size-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute right-1/4 bottom-1/4 size-72 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative flex max-w-md flex-col gap-6 px-12">
        <Badge variant="secondary" className="w-fit gap-1.5 px-3 py-1">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Secure shopping
        </Badge>

        <NovaCommerceLogo size={44} wordmarkClassName="text-2xl" />

        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Shop smarter.
          <span className="text-gradient-hero"> Stay secure.</span>
        </h2>

        <p className="text-base leading-relaxed text-muted-foreground">
          Premium commerce, intelligent discovery, and enterprise-grade checkout — the same
          experience as the storefront, ready when you are.
        </p>

        <div className="mt-2 grid grid-cols-2 gap-4">
          {[
            { label: 'Secure', desc: 'Encrypted sessions' },
            { label: 'Fast', desc: 'Global edge delivery' },
            { label: 'Smart', desc: 'AI-powered search' },
            { label: 'Trusted', desc: '2M+ shoppers' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-border/60 bg-surface/60 p-4 text-left glass"
            >
              <p className="font-semibold text-foreground">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
