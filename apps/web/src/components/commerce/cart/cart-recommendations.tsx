import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { formatPrice, formatReviewCount, productHref, type ProductViewModel } from '@/lib/view-models/product';

export function CartRecommendations({
  products,
  onAdd,
}: {
  products: readonly ProductViewModel[];
  onAdd: (product: ProductViewModel) => void;
}) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="cart-recs-heading" className="mt-10">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 id="cart-recs-heading" className="text-lg font-semibold text-ink">
          You might also like
        </h2>
        <Link
          href="/shop"
          className="inline-flex h-11 items-center gap-1 text-sm font-medium text-primary hover:text-primary-strong focus-ring"
        >
          View all
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
        {products.map((product) => (
          <li key={product.id}>
            <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-surface p-3 shadow-card-soft">
              <Link
                href={productHref(product.slug)}
                className="relative aspect-square overflow-hidden rounded-xl bg-surface-subtle"
              >
                <Image
                  src={product.imageUrl}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 180px"
                  className="object-cover"
                />
              </Link>
              <h3 className="mt-3 line-clamp-2 min-h-10 text-sm font-semibold text-ink">
                <Link href={productHref(product.slug)} className="hover:text-primary focus-ring">
                  {product.name}
                </Link>
              </h3>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                <Star className="size-3 fill-warning text-warning" aria-hidden="true" />
                <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>
                <span>({formatReviewCount(product.reviewCount)})</span>
              </p>
              <p className="mt-1 text-sm font-extrabold text-ink">
                {formatPrice(product.price, product.currency)}
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-3 h-11 w-full"
                disabled={product.inStock === false}
                onClick={() => onAdd(product)}
              >
                <ShoppingCart className="size-3.5" aria-hidden="true" />
                Add to Cart
              </Button>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
