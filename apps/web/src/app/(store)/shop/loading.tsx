import { Container } from '@novacommerce/ui/components/container';
import { ProductListingSkeleton } from '@/components/commerce/listing/product-listing-skeleton';

export default function ShopLoading() {
  return (
    <div className="bg-page-canvas min-h-svh">
      <Container size="wide" className="py-8 lg:py-10">
        <ProductListingSkeleton />
      </Container>
    </div>
  );
}
