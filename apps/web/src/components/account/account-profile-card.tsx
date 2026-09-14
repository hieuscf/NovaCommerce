import Link from 'next/link';
import { BadgeCheck, Clock, Gift, Package, Pencil, Star } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { accountProfile, accountStats } from '@/lib/mock-data/account';
import { accountSectionHref } from '@/lib/view-models/account';
import { AccountAvatar } from './account-avatar';
import { AccountCard } from './account-card';

const STAT_ICONS = {
  orders: Package,
  spent: Clock,
  points: Gift,
} as const;

export function AccountProfileCard() {
  return (
    <AccountCard padded={false}>
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start">
        <AccountAvatar size={82} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[19px] font-extrabold text-foreground">
            {accountProfile.name}
            {accountProfile.verified ? (
              <BadgeCheck className="size-[18px] fill-info text-white" aria-label="Verified account" />
            ) : null}
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">{accountProfile.email}</p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-tint px-3 py-1 text-[11.5px] font-semibold text-primary">
            <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden="true" />
            {accountProfile.membershipLabel}
          </span>
        </div>
        <Button asChild variant="secondary" size="sm" className="shrink-0 rounded-xl">
          <Link href={accountSectionHref('profile')}>
            <Pencil className="size-3.5" aria-hidden="true" />
            Edit Profile
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 border-t border-border/70 sm:grid-cols-3">
        {accountStats.map((stat, index) => {
          const Icon = STAT_ICONS[stat.id];
          return (
            <div
              key={stat.id}
              className={`flex items-center gap-3 px-6 py-5 ${index > 0 ? 'sm:border-l sm:border-border/70' : ''}`}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-tint text-primary">
                <Icon className="size-[18px]" aria-hidden="true" />
              </span>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-base font-bold text-foreground">{stat.value}</p>
                <p className="truncate text-[11.5px] text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </AccountCard>
  );
}
