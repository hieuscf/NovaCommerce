import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailPage } from '@/components/commerce/product-detail/product-detail-page';
import { getProductDetailBySlug, listProductSlugs } from '@/lib/catalog/get-product-detail';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return listProductSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = getProductDetailBySlug(slug);

  if (!detail) {
    return { title: 'Product not found' };
  }

  return {
    title: detail.product.name,
    description: detail.shortDescription,
    openGraph: {
      title: detail.product.name,
      description: detail.shortDescription,
      images: detail.images[0] ? [{ url: detail.images[0].url, alt: detail.images[0].alt }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const detail = getProductDetailBySlug(slug);

  if (!detail) {
    notFound();
  }

  return <ProductDetailPage detail={detail} />;
}
