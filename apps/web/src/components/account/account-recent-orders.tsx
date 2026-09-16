'use client';

import Link from 'next/link';
import { Package } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { EmptyState } from '@novacommerce/ui/components/empty-state';
import { AccountCard } from './account-card';
import { AccountSectionHeading } from './account-section-heading';

/**
 * Overview rail points shoppers to `/orders`, which loads live Gateway history.
 */
export function AccountRecentOrders() {
  return (
    <AccountCard padded={false}>
      <div className="px-5 pt-5">
        <AccountSectionHeading title="Recent Orders" action="View All" href="/orders" />
      </div>
      <div className="px-5 py-6">
        <EmptyState
          icon={<Package className="size-6" />}
          title="Orders live on My Orders"
          description="Open My Orders to track purchases from your live order history."
          action={
            <Button asChild variant="secondary">
              <Link href="/orders">Go to orders</Link>
            </Button>
          }
        />
      </div>
    </AccountCard>
  );
}
