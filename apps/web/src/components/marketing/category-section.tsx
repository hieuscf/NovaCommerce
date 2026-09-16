import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Container } from '@novacommerce/ui/components/container';
import { CategoryCard } from '@/components/commerce/category-card';
import { categoryShapeBySlug } from '@/components/commerce/product-shape';
import type { CategoryViewModel } from '@/lib/view-models/product';
import { cn } from '@/lib/utils';

export function CategorySection({
  embedded = false,
  categories,
}: {
  embedded?: boolean;
  categories: readonly CategoryViewModel[];
}) {
  const body = (
    <>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 id="shop-by-category" className="text-2xl font-bold tracking-tight text-ink">
            Shop by Category
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Find what you&apos;re looking for</p>
        </div>
        <Button asChild variant="ghost" className="h-auto px-0 text-sm text-copy hover:bg-transparent">
          <Link href="/shop">
            View all categories
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>

      <div className="relative">
        <div className="flex gap-3.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              variant="compact"
              illustration={categoryShapeBySlug[category.slug]}
              className="w-[192px] shrink-0"
            />
          ))}
        </div>
        <Button
          asChild
          variant="secondary"
          size="icon-sm"
          className={cn(
            'absolute top-1/2 right-0 hidden size-8 -translate-y-1/2 rounded-full bg-surface shadow-md xl:inline-flex',
          )}
        >
          <Link href="/shop" aria-label="More categories">
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </div>
    </>
  );

  if (embedded) {
    return (
      <section aria-labelledby="shop-by-category" className="px-1">
        {body}
      </section>
    );
  }

  return (
    <section className="py-14 lg:py-20" aria-labelledby="shop-by-category">
      <Container>{body}</Container>
    </section>
  );
}
