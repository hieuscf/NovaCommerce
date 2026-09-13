import type { ProductViewModel } from '@/lib/view-models/product';
import { ProductCard, ProductCardSkeleton } from '@/components/commerce/product-card';
import { productShapeBySlug } from '@/components/commerce/product-shape';
import { cn } from '@/lib/utils';

export interface ProductGridProps {
  products: ProductViewModel[];
  loading?: boolean;
  columns?: 2 | 3 | 4 | 5;
  variant?: 'default' | 'compact';
  className?: string;
}

export function ProductGrid({
  products,
  loading = false,
  columns = 4,
  variant = 'default',
  className,
}: ProductGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  };

  if (loading) {
    return (
      <div className={cn('grid gap-3.5', gridCols[columns], className)}>
        {Array.from({ length: columns }).map((_, i) => (
          <ProductCardSkeleton key={i} compact={variant === 'compact'} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-3.5', gridCols[columns], className)}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant={variant}
          illustration={variant === 'compact' ? productShapeBySlug[product.slug] : undefined}
        />
      ))}
    </div>
  );
}
