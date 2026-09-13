import type { ReactNode } from 'react';
import { ChevronDown, Globe, Heart, Shield, Sparkles, Star, Zap } from 'lucide-react';
import { NovaCommerceLogo } from '@novacommerce/ui/components/nova-commerce-logo';
import { LoginPodiumArt } from './login-podium-art';

const PERKS = [
  { icon: Shield, title: 'Secure & Trusted', note: 'Your data is always protected' },
  { icon: Zap, title: 'Fast & Reliable', note: 'Built for the future' },
  { icon: Heart, title: 'Better Experience', note: 'Shop, save, enjoy' },
] as const;

const TRUST_AVATARS = ['#c084fc', '#60a5fa', '#34d399'] as const;

export interface AuthSplitShellProps {
  children: ReactNode;
  title: ReactNode;
  description: string;
  /** Register is taller than login — pin the card to the top so it can scroll. */
  align?: 'center' | 'start';
}

export function AuthSplitShell({
  children,
  title,
  description,
  align = 'center',
}: AuthSplitShellProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,1fr)_704px]">
      <section className="bg-login-aside relative flex min-h-0 flex-col overflow-hidden px-6 py-6 sm:px-10 sm:py-8 lg:min-h-[520px] lg:px-14 lg:py-12">
        <NovaCommerceLogo size={30} wordmarkClassName="text-slate-900" />

        <div className="mt-10 lg:mt-16">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold"
            style={{ background: 'rgba(255,255,255,0.72)', color: 'var(--color-primary)' }}
          >
            <Sparkles className="size-3.5" aria-hidden="true" />
            Better Tech, Brighter Tomorrow
          </span>

          <h1 className="mt-6 text-[clamp(1.75rem,4vw,42px)] font-extrabold leading-[1.14] tracking-tight text-slate-900">
            {title}
          </h1>

          <p className="mt-4 max-w-[400px] text-[15px] leading-relaxed text-slate-600">
            {description}
          </p>

          <ul className="mt-8 flex flex-wrap gap-x-10 gap-y-5 lg:mt-9">
            {PERKS.map((perk) => (
              <li key={perk.title} className="flex items-center gap-3">
                <perk.icon className="size-[22px] shrink-0 text-primary" aria-hidden="true" />
                <div className="leading-tight">
                  <p className="text-[13px] font-bold text-slate-900">{perk.title}</p>
                  <p className="text-[11px] text-slate-500">{perk.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 hidden flex-1 items-center justify-center lg:flex">
          <LoginPodiumArt />
        </div>

        <div className="mt-8 flex items-center gap-3 lg:mt-0">
          <div className="flex">
            {TRUST_AVATARS.map((color, index) => (
              <span
                key={color}
                className="size-9 rounded-full border-2 border-white"
                style={{
                  background: `linear-gradient(150deg, ${color}, #1e293b)`,
                  marginLeft: index === 0 ? 0 : -12,
                }}
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-medium text-slate-800">Trusted by 2M+ customers</p>
            <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="flex items-center gap-px text-amber-400" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-3 fill-current" />
                ))}
              </span>
              4.8 (120k+ reviews)
            </p>
          </div>
        </div>
      </section>

      <section className="bg-login-form relative flex flex-col overflow-hidden px-5 py-5 max-lg:order-first sm:px-10 sm:py-6">
        <div className="flex justify-end">
          <p
            className="flex items-center gap-1.5 rounded-md px-2 py-2 text-[13px] font-medium text-slate-600"
            aria-label="Language: English"
          >
            <Globe className="size-[18px]" aria-hidden="true" />
            EN
            <ChevronDown className="size-3.5 opacity-70" aria-hidden="true" />
          </p>
        </div>

        <div
          className={
            align === 'start'
              ? 'flex flex-1 items-start justify-center py-4 sm:py-6'
              : 'flex flex-1 items-center justify-center py-4 sm:py-6'
          }
        >
          <div
            className="w-full max-w-[512px] rounded-2xl border border-slate-200/70 bg-white p-6 sm:p-11"
            style={{ boxShadow: '0 30px 70px -50px rgba(15,23,42,0.6)' }}
          >
            {children}
          </div>
        </div>

        <div
          className="pointer-events-none absolute -right-16 -bottom-24 size-[300px] rounded-full"
          style={{ background: 'rgba(199,210,254,0.45)' }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-[120px] bottom-[-60px] size-[180px] rounded-full"
          style={{ background: 'rgba(221,214,254,0.35)' }}
          aria-hidden="true"
        />
      </section>
    </div>
  );
}
