'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Container } from '@novacommerce/ui/components/container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@novacommerce/ui/components/tabs';
import { ProductGrid } from '@/components/commerce/product-grid';
import type { ProductViewModel } from '@/lib/view-models/product';
import { cn } from '@/lib/utils';

const tabClassName =
  'h-6 rounded-none border-b-2 border-transparent px-0 text-sm text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-ink data-[state=active]:shadow-none';

export function FeaturedProductsSection({
  embedded = false,
  products,
}: {
  embedded?: boolean;
  products: readonly ProductViewModel[];
}) {
  const body = (
    <>
      <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', embedded ? 'mb-4' : 'mb-8')}>
        <div>
          <h2 id="featured-products" className="text-2xl font-bold tracking-tight text-ink">
            Featured Products
          </h2>
        </div>
        <Button asChild variant="ghost" className="h-auto self-start px-0 text-sm text-copy hover:bg-transparent">
          <Link href="/shop">
            View all products
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="bestsellers">
        <TabsList className="mb-4 h-auto gap-5 rounded-none bg-transparent p-0">
          <TabsTrigger value="bestsellers" className={tabClassName}>
            Best Sellers
          </TabsTrigger>
          <TabsTrigger value="new" className={tabClassName}>
            New Arrivals
          </TabsTrigger>
          <TabsTrigger value="sale" className={tabClassName}>
            On Sale
          </TabsTrigger>
        </TabsList>
        <TabsContent value="bestsellers">
          <ProductGrid products={products} columns={embedded ? 5 : 4} variant="compact" />
        </TabsContent>
        <TabsContent value="new">
          <ProductGrid
            products={[
              ...products.filter((product) => product.badge === 'new'),
              ...products.filter((product) => product.badge !== 'new'),
            ]}
            columns={embedded ? 5 : 4}
            variant="compact"
          />
        </TabsContent>
        <TabsContent value="sale">
          <ProductGrid
            products={products.filter((product) => product.compareAtPrice !== undefined)}
            columns={embedded ? 5 : 4}
            variant="compact"
          />
        </TabsContent>
      </Tabs>
    </>
  );

  if (embedded) {
    return (
      <section aria-labelledby="featured-products" className="px-1">
        {body}
      </section>
    );
  }

  return (
    <section className="bg-background-secondary py-14 lg:py-20" aria-labelledby="featured-products">
      <Container>{body}</Container>
    </section>
  );
}
