import Link from 'next/link';
import { PackageSearch } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { EmptyState } from '@novacommerce/ui/components/empty-state';
import { clearShopFilters, shopHref, type ShopQuery } from '@/lib/url/shop-query';

export function ProductListingEmptyState({ query }: { query?: ShopQuery }) {
  const href = query ? shopHref(clearShopFilters(query)) : '/shop';

  return (
    <EmptyState
      icon={<PackageSearch className="size-6" />}
      title="No products found"
      description="We couldn't find any products matching your filters. Try a different combination, or clear them to see this collection."
      action={
        <Button asChild>
          <Link href={href}>Clear all</Link>
        </Button>
      }
    />
  );
}
