import type { ProductViewModel } from '@/lib/view-models/product';
import { applyShopPresentationFilters } from '@/lib/catalog/apply-shop-query';
import { catalogClient } from '@/lib/catalog/client';
import { buildCategoryIndex } from '@/lib/catalog/mappers';
import { shopFacets } from '@/lib/mock-data/catalog';
import { searchClient } from '@/lib/search/client';
import { mapSearchItemToViewModel } from '@/lib/search/mappers';
import { toSearchProductsQuery } from '@/lib/search/to-search-query';
import { parseShopQuery, type ShopQuery } from '@/lib/url/shop-query';
import {
  getShopChildCollections,
  getShopCollection,
  getShopHeader,
  getShopRootCollections,
  isShopCollectionSlug,
  SHOP_RATING_OPTIONS,
  type ShopFacets,
  type ShopHeaderViewModel,
  type ShopRatingFacet,
} from '@/lib/view-models/shop';

export interface ShopPageModel {
  readonly query: ShopQuery;
  readonly header: ShopHeaderViewModel;
  readonly facets: ShopFacets;
  readonly products: readonly ProductViewModel[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
}

function inCollection(product: ProductViewModel, collection: string | undefined): boolean {
  if (!collection) {
    return true;
  }
  return product.categorySlug === collection || product.departmentSlug === collection;
}

function countBy(products: readonly ProductViewModel[], predicate: (product: ProductViewModel) => boolean): number {
  return products.reduce((total, product) => total + (predicate(product) ? 1 : 0), 0);
}

function categoryOptionsFor(query: ShopQuery): { slug: string; name: string }[] {
  if (query.collection) {
    const children = getShopChildCollections(query.collection);
    if (children.length > 0) {
      return children;
    }

    const parent = getShopCollection(query.collection)?.parent?.slug;
    if (parent) {
      return getShopChildCollections(parent);
    }
  }

  return getShopRootCollections();
}

export function buildShopFacets(
  products: readonly ProductViewModel[],
  query: ShopQuery,
): ShopFacets {
  const scoped = products.filter((product) => inCollection(product, query.collection));

  const categories = categoryOptionsFor(query).map((option) => ({
    ...option,
    count: countBy(
      scoped,
      (product) => product.categorySlug === option.slug || product.departmentSlug === option.slug,
    ),
  }));

  const brandNames = new Set(scoped.map((product) => product.brand));
  const knownBrands = shopFacets.brands.filter((brand) => brandNames.has(brand.name));
  const extraBrands = [...brandNames]
    .filter((name) => !knownBrands.some((brand) => brand.name === name))
    .sort((left, right) => left.localeCompare(right))
    .map((name) => ({ slug: name, name }));

  const brands = [...knownBrands, ...extraBrands].map((brand) => ({
    ...brand,
    count: countBy(scoped, (product) => product.brand === brand.name),
  }));

  const ratings: ShopRatingFacet[] = SHOP_RATING_OPTIONS.map((value) => ({
    value,
    count: countBy(scoped, (product) => product.rating >= value),
  }));

  return {
    categories,
    brands,
    ratings,
    inStockCount: countBy(scoped, (product) => product.inStock !== false),
  };
}

/**
 * Loads `/shop` and `/shop/[category]` from Gateway Search (`GET /search/products`).
 * Categories come from Catalog so collection slugs can map to `categoryId`.
 * Search does not query PostgreSQL; brand/rating/sale/availability stay presentation filters
 * on the current result page.
 */
export async function getShopPageModel(
  searchParams: Record<string, string | string[] | undefined>,
  collection?: string,
): Promise<ShopPageModel | null> {
  if (collection && !isShopCollectionSlug(collection)) {
    return null;
  }

  const query = parseShopQuery(searchParams, { collection });
  const categories = await catalogClient.listCategories();
  const categoryIndex = buildCategoryIndex(categories);
  const result = await searchClient.searchProducts(toSearchProductsQuery(query, categories));
  const mapped = result.items.map((item) => mapSearchItemToViewModel(item, categoryIndex));
  const products = applyShopPresentationFilters(mapped, query);

  return {
    query,
    header: getShopHeader(query),
    facets: buildShopFacets(mapped, query),
    products,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages === 0 && result.total === 0 ? 0 : result.totalPages,
  };
}
