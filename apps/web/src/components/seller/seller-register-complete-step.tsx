'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  Clock3,
  FileText,
  Mail,
  Rocket,
  Store,
} from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';

const NEXT_STEPS = [
  {
    icon: FileText,
    title: 'Review Information',
    note: '1-3 business days',
  },
  {
    icon: Mail,
    title: 'Account Approval',
    note: "You'll get an email",
  },
  {
    icon: Store,
    title: 'Set Up Store',
    note: 'Add products & settings',
  },
  {
    icon: Rocket,
    title: 'Start Selling',
    note: 'Grow your business',
  },
] as const;

function SuccessBurst() {
  return (
    <div className="relative mx-auto grid size-[88px] place-items-center" aria-hidden="true">
      {Array.from({ length: 12 }, (_, index) => {
        const angle = index * 30;
        return (
          <span
            key={angle}
            className="absolute top-1/2 left-1/2 h-2.5 w-0.5 -translate-x-1/2 -translate-y-[42px] rounded-full bg-primary/55"
            style={{
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-38px)`,
              background:
                index % 3 === 0
                  ? 'linear-gradient(180deg, #f97316, transparent)'
                  : 'linear-gradient(180deg, #6366f1, transparent)',
            }}
          />
        );
      })}
      <span className="grid size-[72px] place-items-center rounded-full bg-primary text-primary-foreground shadow-cta">
        <Check className="size-9" strokeWidth={3} />
      </span>
    </div>
  );
}

export function SellerRegisterCompleteStep({
  email,
}: {
  email: string;
}) {
  const displayEmail = email.trim() || 'youremail@example.com';

  return (
    <div className="mt-8 flex flex-col items-center text-center">
      <SuccessBurst />

      <h2 className="mt-6 text-[28px] font-extrabold tracking-tight text-ink">
        Your Registration is Complete!
      </h2>
      <p className="mt-3 max-w-[540px] text-[14px] leading-relaxed text-copy">
        Thank you for choosing NovaCommerce. Your information has been successfully submitted and is
        now under review by our team.
      </p>

      <div className="mt-7 w-full rounded-2xl border border-primary/15 bg-primary/6 px-5 py-5 text-left sm:px-6">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/12 text-primary">
            <Clock3 className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-ink">Waiting for Approval</p>
            <p className="mt-1 text-[13px] leading-relaxed text-copy">
              Our team will review your application within 1-3 business days. You will receive an
              email notification once your account is approved.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-primary/10 bg-white/80 px-4 py-3.5">
          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <Mail className="size-4" aria-hidden="true" />
          </span>
          <p className="text-[13px] leading-relaxed text-copy">
            We&apos;ve also sent a confirmation email to your registered email address (
            <span className="font-semibold text-ink">{displayEmail}</span>
            ). Please check your inbox (and spam folder).
          </p>
        </div>
      </div>

      <section className="mt-8 w-full text-left" aria-labelledby="seller-complete-next">
        <h3 id="seller-complete-next" className="text-[15px] font-bold text-ink">
          What happens next?
        </h3>
        <ol className="mt-5 grid gap-4 sm:grid-cols-4 sm:gap-2">
          {NEXT_STEPS.map((step, index) => (
            <li key={step.title} className="relative flex flex-col items-center text-center">
              {index < NEXT_STEPS.length - 1 ? (
                <span
                  className="absolute top-5 left-[calc(50%+28px)] hidden h-px w-[calc(100%-28px)] bg-primary/25 sm:block"
                  aria-hidden="true"
                />
              ) : null}
              <span className="relative z-10 grid size-10 place-items-center rounded-full border border-primary/20 bg-primary/8 text-primary">
                <step.icon className="size-5" aria-hidden="true" />
              </span>
              <p className="mt-3 text-[13px] font-bold text-ink">{step.title}</p>
              <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{step.note}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-8 flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          asChild
          variant="ghost"
          className="h-11 justify-start px-0 text-primary hover:bg-transparent hover:text-primary-strong"
        >
          <Link href="/">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Home
          </Link>
        </Button>
        <Button asChild className="h-11 rounded-full px-7">
          <Link href="/seller">
            <Store className="size-4" aria-hidden="true" />
            Go to Seller Center
          </Link>
        </Button>
      </div>
    </div>
  );
}
