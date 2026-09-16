import { ShopBreadcrumb } from '@/components/commerce/listing/shop-breadcrumb';
import { ProductDetails } from '@/components/commerce/product-detail/product-details';
import { ProductOverview } from '@/components/commerce/product-detail/product-overview';
import { ProductSidebar } from '@/components/commerce/product-detail/product-sidebar';
import { RelatedProducts } from '@/components/commerce/product-detail/related-products';
import { TrustIndicators } from '@/components/commerce/product-detail/trust-indicators';
import type { ProductDetailViewModel } from '@/lib/view-models/product-detail';
import { Container } from '@novacommerce/ui/components/container';

export function ProductDetailPage({ detail }: { detail: ProductDetailViewModel }) {
  const viewAllHref = detail.product.categorySlug
    ? `/shop/${detail.product.categorySlug}`
    : '/shop';

  return (
    <Container size="wide" className="pt-5 pb-28 lg:pt-6 lg:pb-16">
      <ShopBreadcrumb crumbs={detail.crumbs} separator="chevron" />
      <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.92fr)_18.75rem] xl:gap-6">
        <ProductOverview detail={detail} />
        <div className="xl:row-span-2">
          <ProductSidebar detail={detail} />
        </div>
        <div className="xl:col-span-2">
          <TrustIndicators items={detail.trustItems} />
        </div>
      </div>
      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]">
        <ProductDetails detail={detail} />
        <RelatedProducts products={detail.related} viewAllHref={viewAllHref} />
      </div>
    </Container>
  );
}
