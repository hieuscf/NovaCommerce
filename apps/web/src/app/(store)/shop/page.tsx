import type { Metadata } from 'next';
import { Container } from '@novacommerce/ui/components/container';
import { ProductListing } from '@/components/commerce/listing/product-listing';
import { applyShopQuery } from '@/lib/catalog/apply-shop-query';
import { catalogProducts, shopFacets } from '@/lib/mock-data/catalog';
import { parseShopQuery } from '@/lib/url/shop-query';
import { getShopHeader } from '@/lib/view-models/shop';

interface ShopPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const header = getShopHeader(parseShopQuery(await searchParams));
  return {
    title: header.title,
    description: header.description,
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const query = parseShopQuery(await searchParams);
  const header = getShopHeader(query);
  const listing = applyShopQuery(catalogProducts, query);

  return (
    <Container size="wide" className="py-8 lg:py-12">
      <ProductListing
        query={query}
        header={header}
        facets={shopFacets}
        products={listing.items}
        total={listing.total}
        page={listing.page}
        totalPages={listing.totalPages}
      />
    </Container>
  );
}
