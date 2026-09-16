import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Container } from '@novacommerce/ui/components/container';
import { ProductListing } from '@/components/commerce/listing/product-listing';
import { getShopPageModel } from '@/lib/catalog/get-shop-page';
import { parseShopQuery, shopHref } from '@/lib/url/shop-query';

export const dynamic = 'force-dynamic';

interface ShopPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const model = getShopPageModel(await searchParams);
  return {
    title: model?.header.title ?? 'Shop',
    description: model?.header.description,
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const parsed = parseShopQuery(params);
  if (!parsed.collection && parsed.categories.length === 1) {
    redirect(shopHref(parsed));
  }

  const model = getShopPageModel(params);
  if (!model) {
    redirect('/shop');
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
