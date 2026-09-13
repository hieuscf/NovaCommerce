import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Container } from '@novacommerce/ui/components/container';
import { ProductGrid } from '@/components/commerce/product-grid';
import { trendingProducts } from '@/lib/mock-data/homepage';

export function TrendingSection() {
  return (
    <section className="py-14 lg:py-20">
      <Container>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-h2 font-bold tracking-tight text-foreground">Trending Now</h2>
            <p className="mt-2 text-muted-foreground">
              What shoppers are loving this week.
            </p>
          </div>
          <Button asChild variant="ghost" className="self-start sm:self-auto">
            <Link href="/shop?sort=trending">
              View All
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <ProductGrid products={trendingProducts} />
      </Container>
    </section>
  );
}
