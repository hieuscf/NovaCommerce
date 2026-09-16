import { catalogClient } from './client';
import {
  buildCategoryIndex,
  mapProductToViewModel,
  type CategoryIndex,
} from './mappers';
import type { CategoryDto, ProductDto } from './types';
import type { ProductViewModel } from '@/lib/view-models/product';

/** Gateway max pageSize — fetch once, then apply shop filters client-side. */
export const CATALOG_FETCH_PAGE_SIZE = 100;

export interface PublishedCatalogBundle {
  readonly categories: readonly CategoryDto[];
  readonly categoryIndex: CategoryIndex;
  readonly products: readonly ProductDto[];
  readonly viewModels: readonly ProductViewModel[];
}

/**
 * Loads published catalog products + categories for storefront listing/home.
 * Unexpected failures must throw so route error boundaries can recover.
 */
export async function loadPublishedCatalog(): Promise<PublishedCatalogBundle> {
  const [categories, list] = await Promise.all([
    catalogClient.listCategories(),
    catalogClient.listProducts({
      status: 'published',
      page: 1,
      pageSize: CATALOG_FETCH_PAGE_SIZE,
    }),
  ]);

  const categoryIndex = buildCategoryIndex(categories);
  const viewModels = list.items.map((product) => mapProductToViewModel(product, categoryIndex));

  return {
    categories,
    categoryIndex,
    products: list.items,
    viewModels,
  };
}
