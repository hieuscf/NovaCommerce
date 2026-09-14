import Link from 'next/link';
import { ArrowRight, CreditCard, FileText, Heart, MapPin } from 'lucide-react';
import { accountQuickActions } from '@/lib/mock-data/account';
import { accountSectionHref } from '@/lib/view-models/account';
import { cn } from '@/lib/utils';
import { AccountCard } from './account-card';

const ACTION_ICONS = {
  orders: FileText,
  addresses: MapPin,
  payment: CreditCard,
  wishlist: Heart,
} as const;

const TONE_CLASS = {
  brand: 'bg-primary-tint text-primary',
  success: 'bg-success/12 text-success-strong',
  rose: 'bg-[#fdeef2] text-[#e11d63]',
} as const;

export function AccountQuickActions() {
  return (
    <AccountCard>
      <h2 className="text-base font-bold text-foreground">Quick Actions</h2>
      <div className="mt-4 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {accountQuickActions.map((action) => {
          const Icon = ACTION_ICONS[action.section];
          return (
            <Link
              key={action.section}
              href={accountSectionHref(action.section)}
              className={cn(
                'rounded-xl border border-border/80 bg-surface p-4 text-left transition-colors',
                'hover:border-primary/30',
              )}
            >
              <span className={cn('grid size-10 place-items-center rounded-xl', TONE_CLASS[action.tone])}>
                <Icon className="size-[18px]" aria-hidden="true" />
              </span>
              <p className="mt-3.5 text-[12.5px] font-bold text-foreground">{action.title}</p>
              <div className="mt-1 flex items-end justify-between gap-2">
                <p className="text-[11px] text-muted-foreground">{action.note}</p>
                <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              </div>
            </Link>
          );
        })}
      </div>
    </AccountCard>
  );
}
