import { ProductCard } from '@/components/commerce/product-card';
import type { ProductViewModel } from '@/lib/view-models/product';

export function RelatedProducts({ products }: { products: readonly ProductViewModel[] }) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="related-heading" className="scroll-mt-24">
      <h2 id="related-heading" className="text-h3 text-ink">
        You May Also Like
      </h2>
      <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 xl:gap-5">
        {products.map((product) => (
          <li key={product.id} className="h-full">
            <ProductCard product={product} variant="listing" />
          </li>
        ))}
      </ul>
    </section>
  );
}
