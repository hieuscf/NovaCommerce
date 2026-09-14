import Link from 'next/link';
import { Bell, Heart } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { EmptyState } from '@novacommerce/ui/components/empty-state';
import { accountSectionHref, type AccountSection } from '@/lib/view-models/account';

const PENDING: Partial<
  Record<AccountSection, { icon: typeof Heart; title: string; description: string }>
> = {
  wishlist: {
    icon: Heart,
    title: 'Wishlist is coming next',
    description: 'Saved items will appear here when the customer wishlist API is available.',
  },
  notifications: {
    icon: Bell,
    title: 'No notifications yet',
    description: 'Order and account alerts will appear here when Notification APIs are connected.',
  },
};

export function AccountPendingPanel({ section }: { section: AccountSection }) {
  const copy = PENDING[section];
  if (!copy) {
    return null;
  }

  const Icon = copy.icon;

  return (
    <EmptyState
      icon={<Icon className="size-6" />}
      title={copy.title}
      description={copy.description}
      action={
        <Button asChild variant="secondary">
          <Link href={accountSectionHref('overview')}>Back to overview</Link>
        </Button>
      }
    />
  );
}
