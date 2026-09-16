import {
  countProductsInCategoryTree,
  mapCategoryToViewModel,
} from '@/lib/catalog/mappers';
import { loadPublishedCatalog } from '@/lib/catalog/load-published-catalog';
import type { CategoryViewModel, ProductViewModel } from '@/lib/view-models/product';

const FEATURED_PRODUCT_LIMIT = 5;
const FEATURED_CATEGORY_LIMIT = 6;

export interface HomepageCatalogModel {
  readonly categories: readonly CategoryViewModel[];
  readonly featuredProducts: readonly ProductViewModel[];
}

/**
 * Homepage merchandising rails from Gateway categories + published products.
 * Hero/promo/benefits stay static presentation content.
 */
export async function getHomepageCatalog(): Promise<HomepageCatalogModel> {
  const catalog = await loadPublishedCatalog();

  const roots = catalog.categories
    .filter((category) => !category.parentId)
    .slice(0, FEATURED_CATEGORY_LIMIT)
    .map((category) =>
      mapCategoryToViewModel(
        category,
        countProductsInCategoryTree(category.id, catalog.categoryIndex, catalog.products),
      ),
    );

  const featuredProducts = [...catalog.viewModels]
    .sort((left, right) => {
      const leftTime = Date.parse(left.createdAt ?? '') || 0;
      const rightTime = Date.parse(right.createdAt ?? '') || 0;
      return rightTime - leftTime;
    })
    .slice(0, FEATURED_PRODUCT_LIMIT);

  return {
    categories: roots,
    featuredProducts,
  };
}
