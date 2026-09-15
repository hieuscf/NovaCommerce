import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { EmptyState } from '@novacommerce/ui/components/empty-state';

export function CheckoutEmptyState() {
  return (
    <EmptyState
      icon={<ShoppingBag className="size-6" />}
      title="Your checkout is empty"
      description="Add items to your cart before completing an order."
      action={
        <Button asChild>
          <Link href="/shop">Continue shopping</Link>
        </Button>
      }
    />
  );
}
