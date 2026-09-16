import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/commerce/product-card';
import type { ProductViewModel } from '@/lib/view-models/product';

export function RelatedProducts({
  products,
  viewAllHref = '/shop',
}: {
  products: readonly ProductViewModel[];
  viewAllHref?: string;
}) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="related-heading"
      className="rounded-[1.75rem] border border-border/70 bg-surface p-5 shadow-card-soft md:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="related-heading" className="text-lg font-semibold text-ink">
          You Might Also Like
        </h2>
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-strong focus-ring"
        >
          View all
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
      <ul className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        {products.map((product) => (
          <li key={product.id} className="h-full">
            <ProductCard product={product} variant="listing" />
          </li>
        ))}
      </ul>
    </section>
  );
}
