import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailPage } from '@/components/products/product-detail-page';
import { getProductDetail } from '@/lib/mock-data/products';

type ProductDetailRouteProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProductDetailRouteProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductDetail(id);
  return {
    title: product ? product.name : 'Product',
  };
}

export default async function ProductDetailRoute({ params }: ProductDetailRouteProps) {
  const { id } = await params;
  const product = getProductDetail(id);
  if (!product) {
    notFound();
  }
  return <ProductDetailPage product={product} />;
}
