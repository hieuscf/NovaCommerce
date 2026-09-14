import Link from 'next/link';
import {
  Bell,
  CircleUser,
  CreditCard,
  Heart,
  HelpCircle,
  MapPin,
  Package,
  ShieldCheck,
  UserCog,
  Crown,
  ArrowRight,
} from 'lucide-react';
import { accountProfile } from '@/lib/mock-data/account';
import {
  ACCOUNT_SECTION_LABELS,
  accountSectionHref,
  type AccountSection,
} from '@/lib/view-models/account';
import { cn } from '@/lib/utils';
import { AccountAvatar } from './account-avatar';
import { AccountCard } from './account-card';

const NAV_ITEMS: readonly {
  section: AccountSection;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { section: 'overview', icon: CircleUser },
  { section: 'orders', icon: Package },
  { section: 'addresses', icon: MapPin },
  { section: 'payment', icon: CreditCard },
  { section: 'wishlist', icon: Heart },
  { section: 'profile', icon: UserCog },
  { section: 'notifications', icon: Bell },
  { section: 'security', icon: ShieldCheck },
  { section: 'help', icon: HelpCircle },
];

export function AccountSidebar({ section }: { section: AccountSection }) {
  return (
    <AccountCard className="h-fit" padded={false}>
      <div className="flex items-center gap-3 p-5">
        <AccountAvatar size={44} />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-bold text-foreground">{accountProfile.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">{accountProfile.email}</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3 pb-4" aria-label="Account">
        {NAV_ITEMS.map((item) => {
          const active = item.section === section;
          const Icon = item.icon;
          return (
            <Link
              key={item.section}
              href={accountSectionHref(item.section)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-[13px] font-medium transition-colors',
                active
                  ? 'bg-primary-tint text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="size-[18px] shrink-0" aria-hidden="true" />
              {ACCOUNT_SECTION_LABELS[item.section]}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/70 p-4">
        <div className="rounded-xl bg-primary-tint p-4">
          <div className="flex items-start gap-2.5">
            <Crown className="size-[18px] shrink-0 text-primary" aria-hidden="true" />
            <div className="leading-tight">
              <p className="text-[12.5px] font-bold text-primary">{accountProfile.membershipLabel}</p>
              <p className="mt-1 text-[10.5px] text-muted-foreground">{accountProfile.membershipNote}</p>
              <Link
                href={accountSectionHref('overview')}
                className="mt-2.5 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-primary"
              >
                View benefits
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AccountCard>
  );
}
