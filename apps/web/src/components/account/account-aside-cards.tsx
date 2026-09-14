import Link from 'next/link';
import { ArrowRight, CreditCard, Headphones, Home, MapPin, MoreVertical, Pencil, Star } from 'lucide-react';
import { Badge } from '@novacommerce/ui/components/badge';
import { Button } from '@novacommerce/ui/components/button';
import {
  accountAddresses,
  accountLoyaltyPoints,
  accountPaymentMethods,
} from '@/lib/mock-data/account';
import { accountSectionHref } from '@/lib/view-models/account';
import { AccountCard } from './account-card';
import { AccountSectionHeading } from './account-section-heading';

export function AccountLoyaltyCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-offer-rail p-5 shadow-card-soft">
      <AccountSectionHeading icon={Star} title="Loyalty Points" />
      <p className="mt-4 text-[28px] leading-none font-extrabold text-foreground">
        {accountLoyaltyPoints} <span className="text-[17px] font-bold">points</span>
      </p>
      <p className="mt-3 max-w-[210px] text-[11.5px] text-copy">
        Collect more points and unlock special rewards!
      </p>
      <Button
        asChild
        variant="secondary"
        size="sm"
        className="mt-4 h-9 rounded-full border-primary/20 bg-white/80 text-primary hover:bg-white"
      >
        <Link href={accountSectionHref('overview')}>
          View Rewards
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </Button>
      <div className="absolute right-6 bottom-6 hidden sm:block" aria-hidden="true">
        <div
          className="relative size-[74px] overflow-hidden rounded-[12px] shadow-cta"
          style={{ backgroundImage: 'linear-gradient(160deg, #a5b4fc 0%, #6366f1 60%, #4338ca 100%)' }}
        >
          <span className="absolute bottom-0 left-1/2 h-full w-2 -translate-x-1/2 bg-white/75" />
          <span className="absolute top-[26px] left-0 h-2 w-full bg-white/75" />
          <span className="absolute -top-1.5 left-1/2 size-[22px] -translate-x-1/2 rounded-full border-[6px] border-white/75" />
        </div>
      </div>
    </div>
  );
}

export function AccountAddresses() {
  return (
    <AccountCard>
      <AccountSectionHeading
        icon={MapPin}
        title="Saved Addresses"
        action="Manage All"
        href={accountSectionHref('addresses')}
      />
      <ul className="mt-4 flex flex-col gap-3">
        {accountAddresses.map((address) => (
          <li key={address.id} className="flex items-start gap-3 rounded-xl border border-border/80 p-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-tint text-primary">
              <Home className="size-[17px]" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 leading-relaxed">
              <p className="text-[12.5px] font-bold text-foreground">{address.label}</p>
              <p className="text-xs font-medium text-foreground/80">{address.recipient}</p>
              <p className="text-[11.5px] text-muted-foreground">{address.line1}</p>
              <p className="text-[11.5px] text-muted-foreground">{address.line2}</p>
            </div>
            <div className="flex shrink-0 items-center text-muted-foreground">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled
                aria-label="Edit address. Address editing will connect when User APIs are available."
              >
                <Pencil className="size-3.5" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled
                aria-label="More address options. Address management will connect when User APIs are available."
              >
                <MoreVertical className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </AccountCard>
  );
}

function CardBrandMark({ brand }: { brand: 'visa' | 'mastercard' }) {
  if (brand === 'visa') {
    return <span className="text-xs font-extrabold tracking-tight text-[#1a1f71] italic">VISA</span>;
  }

  return (
    <span className="relative block h-[18px] w-[30px]" aria-hidden="true">
      <span className="absolute top-0 left-0 size-[18px] rounded-full bg-[#eb001b]" />
      <span className="absolute top-0 right-0 size-[18px] rounded-full bg-[#f79e1b] opacity-90" />
    </span>
  );
}

export function AccountPaymentMethods() {
  return (
    <AccountCard>
      <AccountSectionHeading
        icon={CreditCard}
        title="Payment Methods"
        action="Manage All"
        href={accountSectionHref('payment')}
      />
      <ul className="mt-4 flex flex-col gap-3">
        {accountPaymentMethods.map((card) => (
          <li key={card.id} className="flex items-center gap-3 rounded-xl border border-border/80 p-3.5">
            <span className="grid h-9 w-[54px] shrink-0 place-items-center rounded-lg border border-border bg-surface">
              <CardBrandMark brand={card.brand} />
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[13px] font-bold text-foreground">•••• {card.last4}</p>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">Expires {card.expires}</p>
            </div>
            {card.isDefault ? (
              <Badge variant="success" className="shrink-0">
                Default
              </Badge>
            ) : null}
            <div className="flex shrink-0 items-center text-muted-foreground">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled
                aria-label="Edit card. Payment methods will connect when Payment APIs are available."
              >
                <Pencil className="size-3.5" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled
                aria-label="More card options. Payment methods will connect when Payment APIs are available."
              >
                <MoreVertical className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </AccountCard>
  );
}

export function AccountHelp() {
  return (
    <AccountCard>
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-tint text-primary">
          <Headphones className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground">Need Help?</p>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            Our support team is here to help you
          </p>
          <Button asChild size="sm" variant="primary-gradient" className="mt-3 h-9 rounded-full">
            <Link href={accountSectionHref('help')}>
              Contact Support
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </AccountCard>
  );
}
