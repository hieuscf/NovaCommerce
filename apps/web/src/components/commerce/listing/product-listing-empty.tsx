import Link from 'next/link';
import { PackageSearch } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { EmptyState } from '@novacommerce/ui/components/empty-state';

export function ProductListingEmptyState() {
  return (
    <EmptyState
      icon={<PackageSearch className="size-6" />}
      title="No products found"
      description="We couldn't find any products matching your filters."
      action={
        <Button asChild>
          <Link href="/shop">Clear Filters</Link>
        </Button>
      }
    />
  );
}
