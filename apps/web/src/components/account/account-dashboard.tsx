'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Container } from '@novacommerce/ui/components/container';
import { ErrorState } from '@novacommerce/ui/components/error-state';
import { OrderListContainer } from '@/components/commerce/orders/order-list-container';
import { AccountProvider, useAccount } from '@/features/account/account-context';
import { ACCOUNT_SECTION_LABELS, type AccountSection } from '@/lib/view-models/account';
import {
  AccountAddresses,
  AccountHelp,
  AccountLoyaltyCard,
  AccountPaymentMethods,
} from './account-aside-cards';
import { AccountHeaderArt } from './account-header-art';
import { AccountNotificationsPanel } from './account-notifications-panel';
import { AccountPendingPanel } from './account-pending-panel';
import { AccountProfileCard } from './account-profile-card';
import { AccountQuickActions } from './account-quick-actions';
import { AccountRecentOrders } from './account-recent-orders';
import { AccountSecurityPanel } from './account-security-panel';
import { AccountSidebar } from './account-sidebar';

function AccountPageHeader({ section }: { section: AccountSection }) {
  return (
    <header className="lg:col-span-2">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-3.5" aria-hidden="true" />
        {section === 'overview' ? (
          <span className="font-medium text-foreground/80">My Account</span>
        ) : (
          <>
            <Link href="/account" className="hover:text-foreground">
              My Account
            </Link>
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <span className="font-medium text-foreground/80">{ACCOUNT_SECTION_LABELS[section]}</span>
          </>
        )}
      </nav>
      <h1 className="mt-3 text-[32px] font-extrabold tracking-tight text-foreground">My Account</h1>
      <p className="mt-2 text-[13.5px] text-copy">
        Manage your profile, orders, addresses and preferences all in one place.
      </p>
    </header>
  );
}

function AccountSectionPanel({ section }: { section: AccountSection }) {
  switch (section) {
    case 'orders':
      return null;
    case 'addresses':
      return <AccountAddresses />;
    case 'payment':
      return <AccountPaymentMethods />;
    case 'profile':
      return <AccountProfileCard />;
    case 'security':
      return <AccountSecurityPanel />;
    case 'notifications':
      return <AccountNotificationsPanel />;
    case 'help':
      return <AccountHelp />;
    case 'wishlist':
      return <AccountPendingPanel section={section} />;
    default:
      return null;
  }
}

function AccountDashboardBody({ section }: { section: AccountSection }) {
  const { status, error, reload } = useAccount();
  const overview = section === 'overview';

  if (status === 'error') {
    return (
      <div className="bg-background min-h-svh">
        <Container size="wide" className="relative py-12">
          <ErrorState
            title="Could not load your account"
            description={error ?? 'Please try again.'}
            action={
              <Button type="button" onClick={() => void reload()}>
                Try again
              </Button>
            }
          />
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-svh">
      <Container size="wide" className="relative pt-6 pb-12">
        <AccountHeaderArt />
        <div className="grid gap-5 lg:grid-cols-[248px_minmax(0,1fr)_372px]">
          <div className="lg:row-span-2">
            <AccountSidebar section={section} />
          </div>
          <AccountPageHeader section={section} />
          {overview ? (
            <>
              <div className="flex min-w-0 flex-col gap-5">
                <AccountProfileCard />
                <AccountQuickActions />
                <AccountRecentOrders />
              </div>
              <aside className="flex min-w-0 flex-col gap-5">
                <AccountLoyaltyCard />
                <AccountAddresses />
                <AccountPaymentMethods />
                <AccountHelp />
              </aside>
            </>
          ) : (
            <div className="min-w-0 lg:col-span-2">
              <AccountSectionPanel section={section} />
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}

export function AccountDashboard({ section }: { section: AccountSection }) {
  if (section === 'orders') {
    return <OrderListContainer query={{ status: 'all', page: 1 }} />;
  }

  return (
    <AccountProvider>
      <AccountDashboardBody section={section} />
    </AccountProvider>
  );
}
