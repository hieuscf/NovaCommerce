import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/store/breadcrumbs';
import { ProductDetailView } from '@/components/store/product-detail-view';
import {
  getCategoryBySlug,
  getProductBySlug,
  getSimilarProducts,
  productReviews,
} from '@/lib/mock/catalog';

type ProductDetailPageProps = {
  params: {
    slug: string;
  };
};

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = getProductBySlug(params.slug);
  if (!product) {
    notFound();
  }

  const category = getCategoryBySlug(product.categorySlug);
  const reviews = productReviews[product.slug] ?? [];
  const similarProducts = getSimilarProducts(product);

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { href: '/', label: 'Trang chu' },
          ...(category
            ? [{ href: `/category/${category.slug}`, label: category.name }]
            : []),
          { label: product.name },
        ]}
      />
      <ProductDetailView
        product={product}
        reviews={reviews}
        similarProducts={similarProducts}
      />
    </div>
  );
}
