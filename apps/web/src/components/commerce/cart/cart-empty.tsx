import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { EmptyState } from '@novacommerce/ui/components/empty-state';

export function CartEmptyState() {
  return (
    <EmptyState
      icon={<ShoppingBag className="size-6" />}
      title="Your cart is empty"
      description="Browse the shop and add items you want to buy."
      action={
        <Button asChild>
          <Link href="/shop">Continue shopping</Link>
        </Button>
      }
    />
  );
}
