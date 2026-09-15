import { ShopBreadcrumb } from '@/components/commerce/listing/shop-breadcrumb';
import { ProductDetails } from '@/components/commerce/product-detail/product-details';
import { ProductOverview } from '@/components/commerce/product-detail/product-overview';
import { ProductReviews } from '@/components/commerce/product-detail/product-reviews';
import { RelatedProducts } from '@/components/commerce/product-detail/related-products';
import type { ProductDetailViewModel } from '@/lib/view-models/product-detail';
import { Container } from '@novacommerce/ui/components/container';

export function ProductDetailPage({ detail }: { detail: ProductDetailViewModel }) {
  return (
    <Container size="wide" className="pt-6 pb-28 lg:pt-8 lg:pb-16">
      <ShopBreadcrumb crumbs={detail.crumbs} />
      <div className="mt-6 lg:mt-8">
        <ProductOverview detail={detail} />
      </div>
      <div className="mt-16 space-y-16 lg:mt-20 lg:space-y-20">
        <ProductDetails detail={detail} />
        <ProductReviews detail={detail} />
        <RelatedProducts products={detail.related} />
      </div>
    </Container>
  );
}
