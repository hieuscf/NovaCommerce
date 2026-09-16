import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@novacommerce/ui/components/container';
import { ProductListing } from '@/components/commerce/listing/product-listing';
import { getShopPageModel } from '@/lib/catalog/get-shop-page';
import { getShopCollection, listShopCollectionSlugs } from '@/lib/view-models/shop';

interface ShopCollectionPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export function generateStaticParams() {
  return listShopCollectionSlugs().map((category) => ({ category }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: ShopCollectionPageProps): Promise<Metadata> {
  const { category } = await params;
  const collection = getShopCollection(category);
  if (!collection) {
    return { title: 'Collection not found' };
  }
  return {
    title: collection.name,
    description: collection.description,
  };
}

export default async function ShopCollectionPage({
  params,
  searchParams,
}: ShopCollectionPageProps) {
  const { category } = await params;
  const model = getShopPageModel(await searchParams, category);

  if (!model) {
    notFound();
  }

  return (
    <div className="bg-page-canvas min-h-svh">
      <Container size="wide" className="py-8 lg:py-10">
        <ProductListing
          query={model.query}
          header={model.header}
          facets={model.facets}
          products={model.products}
          total={model.total}
          page={model.page}
          totalPages={model.totalPages}
        />
      </Container>
    </div>
  );
}
