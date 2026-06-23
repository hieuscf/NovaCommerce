import { Star } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import { formatVnd, getProductPriceRange } from '@/lib/mock/catalog';
import type { Product, ProductBadge } from '@/types/product';

const badgeLabels: Record<ProductBadge, string> = {
  new: 'Moi',
  hot: 'Hot',
  sale: 'Sale',
};

const badgeStyles: Record<ProductBadge, string> = {
  new: 'bg-blue-100 text-blue-700',
  hot: 'bg-rose-100 text-rose-700',
  sale: 'bg-emerald-100 text-emerald-700',
};

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { minPrice, maxPrice } = getProductPriceRange(product);
  const priceLabel =
    minPrice === maxPrice
      ? formatVnd(minPrice)
      : `${formatVnd(minPrice)} - ${formatVnd(maxPrice)}`;

  return (
    <Card className="overflow-hidden border transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <Link className="block" href={`/products/${product.slug}`}>
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            <img
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              src={product.images[0]}
            />
            <div className="absolute left-2 top-2 flex gap-1">
              {product.badges.map((badge) => (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeStyles[badge]}`}
                  key={badge}
                >
                  {badgeLabels[badge]}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-2 p-4">
            <p className="line-clamp-2 min-h-[2.5rem] text-sm font-medium">
              {product.name}
            </p>
            <p className="text-sm text-muted-foreground">{product.brand}</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{priceLabel}</p>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="size-4 fill-current" />
                <span className="text-xs text-foreground">
                  {product.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
