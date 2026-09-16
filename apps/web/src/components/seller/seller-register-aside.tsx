import { Settings2, Shield, Users } from 'lucide-react';
import { SellerShopArt } from './seller-shop-art';

const BENEFITS = [
  {
    icon: Users,
    title: 'Reach More Customers',
    note: 'Access millions of active buyers',
  },
  {
    icon: Settings2,
    title: 'Simple Setup Process',
    note: 'Get started in just a few steps',
  },
  {
    icon: Shield,
    title: 'Secure & Trusted Platform',
    note: 'Built with your success in mind',
  },
] as const;

export function SellerRegisterAside() {
  return (
    <aside className="flex flex-col lg:max-w-[420px] lg:pt-4">
      <p className="text-[13px] font-semibold tracking-wide text-primary">Seller Center</p>
      <h1 className="mt-3 text-[clamp(1.85rem,3.4vw,2.75rem)] font-extrabold leading-[1.12] tracking-tight text-ink">
        Start Your Business
        <br />
        on NovaCommerce
      </h1>
      <p className="mt-4 max-w-[360px] text-[15px] leading-relaxed text-copy">
        Join thousands of successful sellers and reach millions of customers worldwide. It&apos;s
        easy, fast and free to get started.
      </p>

      <ul className="mt-8 space-y-4">
        {BENEFITS.map((benefit) => (
          <li key={benefit.title} className="flex items-center gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <benefit.icon className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="text-[15px] font-bold text-ink">{benefit.title}</p>
              <p className="mt-0.5 text-[13px] text-muted-foreground">{benefit.note}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 hidden lg:block">
        <SellerShopArt />
      </div>

      <figure className="mt-2 rounded-2xl border border-white/70 bg-white/80 p-5 shadow-card-soft backdrop-blur-sm">
        <blockquote className="text-[13.5px] leading-relaxed text-copy">
          <span className="mr-1 text-2xl leading-none font-serif text-primary/50" aria-hidden="true">
            “
          </span>
          NovaCommerce has made it so easy for us to grow our business. The platform is user-friendly
          and the support team is amazing!
        </blockquote>
        <figcaption className="mt-4 flex items-center gap-3">
          <span
            className="grid size-10 place-items-center rounded-full text-[12px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #c4b5fd, #6366f1)' }}
            aria-hidden="true"
          >
            SJ
          </span>
          <div className="leading-tight">
            <p className="text-[13px] font-semibold text-ink">Sarah Johnson</p>
            <p className="text-[12px] text-muted-foreground">Store Owner · TechWorld</p>
          </div>
        </figcaption>
      </figure>
    </aside>
  );
}
