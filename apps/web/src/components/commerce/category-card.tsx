import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@novacommerce/ui/components/card';
import { Skeleton } from '@novacommerce/ui/components/skeleton';
import type { CategoryViewModel } from '@/lib/view-models/product';
import { ProductShape, type ProductShapeName } from '@/components/commerce/product-shape';
import { cn } from '@/lib/utils';

export interface CategoryCardProps {
  category: CategoryViewModel;
  variant?: 'default' | 'compact';
  illustration?: ProductShapeName;
  className?: string;
}

export function CategoryCard({
  category,
  variant = 'default',
  illustration,
  className,
}: CategoryCardProps) {
  const compact = variant === 'compact';
  const useIllustration = compact && illustration;

  return (
    <Link href={`/shop?category=${category.slug}`} className={cn('group block', className)}>
      <Card
        className={cn(
          'overflow-hidden border-border/80 bg-surface p-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
          compact && 'rounded-[18px] shadow-card-soft',
        )}
      >
        <div
          className={cn(
            'relative overflow-hidden',
            useIllustration ? 'nova-shot h-[78px]' : compact ? 'h-[78px] bg-surface-subtle' : 'aspect-[4/3] bg-surface-subtle',
          )}
        >
          {useIllustration ? (
            <>
              <ProductShape shape={illustration} />
              <span className="nova-shot-glow absolute inset-x-0 -bottom-[40%] h-[70%]" />
            </>
          ) : (
            <Image
              src={category.imageUrl}
              alt={category.name}
              fill
              sizes="(max-width: 640px) 50vw, 192px"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          )}
        </div>
        <div className={cn(compact ? 'px-3 py-2.5' : 'p-4')}>
          <h3 className={cn('truncate font-semibold text-ink', compact ? 'text-sm' : 'text-foreground')}>
            {category.name}
          </h3>
          <p className={cn('truncate text-muted-foreground', compact ? 'text-[11px]' : 'mt-1 text-sm')}>
            {category.productCount}+ products
          </p>
        </div>
      </Card>
    </Link>
  );
}

export function CategoryCardSkeleton() {
  return (
    <Card className="overflow-hidden p-0">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="grid gap-2 p-4">
        <Skeleton variant="text" className="h-5 w-24" />
        <Skeleton variant="text" className="w-16" />
      </div>
    </Card>
  );
}
