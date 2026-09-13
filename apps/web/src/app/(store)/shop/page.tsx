import Link from 'next/link';
import { Package } from 'lucide-react';
import { ProductGrid } from '@/components/commerce/product-grid';
import { Container } from '@novacommerce/ui/components/container';
import { EmptyState } from '@novacommerce/ui/components/empty-state';
import { Button } from '@novacommerce/ui/components/button';
import { featuredProducts, trendingProducts } from '@/lib/mock-data/homepage';
import { parseShopQuery } from '@/lib/url/shop-query';

export const metadata = {
  title: 'Shop',
  description: 'Browse premium products at NovaCommerce.',
};

interface ShopPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const query = parseShopQuery(await searchParams);
  const catalog = [...featuredProducts, ...trendingProducts];

  const products = catalog.filter((product) => {
    if (query.q) {
      const haystack = `${product.name} ${product.brand}`.toLowerCase();
      if (!haystack.includes(query.q.toLowerCase())) {
        return false;
      }
    }
    if (query.sale && product.badge !== 'sale') {
      return false;
    }
    return true;
  });

  const sorted = [...products].sort((left, right) => {
    if (query.sort === 'price-asc') {
      return left.price - right.price;
    }
    if (query.sort === 'price-desc') {
      return right.price - left.price;
    }
    return 0;
  });

  return (
    <Container className="py-10 lg:py-14">
      <div className="mb-8">
        <h1 className="text-h1 font-bold tracking-tight text-foreground">Shop</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our curated catalog. Filters and search will connect to the API Gateway.
        </p>
        {query.q || query.category || query.sale ? (
          <p className="mt-3 text-sm text-muted-foreground">
            {query.q ? `Search: “${query.q}”. ` : null}
            {query.category ? `Category: ${query.category}. ` : null}
            {query.sale ? 'Showing sale items. ' : null}
          </p>
        ) : null}
      </div>

      {sorted.length > 0 ? (
        <ProductGrid products={sorted} columns={4} />
      ) : (
        <EmptyState
          icon={<Package className="size-6" />}
          title="No products found"
          description="Try adjusting your filters or browse all categories."
          action={
            <Button asChild>
              <Link href="/shop">Browse all</Link>
            </Button>
          }
        />
      )}
    </Container>
  );
}
