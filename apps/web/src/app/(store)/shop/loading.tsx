import { Container } from '@novacommerce/ui/components/container';
import { ProductListingSkeleton } from '@/components/commerce/listing/product-listing-skeleton';
import { Skeleton } from '@novacommerce/ui/components/skeleton';

export default function ShopLoading() {
  return (
    <Container size="wide" className="py-8 lg:py-12">
      <div className="space-y-5">
        <Skeleton variant="text" className="h-3 w-36" />
        <ProductListingSkeleton />
      </div>
    </Container>
  );
}
