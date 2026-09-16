import type { CategoryDto } from '@/lib/catalog/types';
import type { ShopQuery } from '@/lib/url/shop-query';
import { SHOP_PAGE_SIZE } from '@/lib/view-models/shop';
import type { ProductSearchSortDto, SearchProductsQuery } from './types';

export function resolveShopCategoryId(
  query: ShopQuery,
  categories: readonly CategoryDto[],
): string | undefined {
  const slugs = [...query.categories, query.collection].filter(
    (slug): slug is string => Boolean(slug),
  );

  for (const slug of slugs) {
    const match = categories.find((category) => category.slug === slug);
    if (match) {
      return match.id;
    }
  }

  return undefined;
}

export function toSearchSort(query: ShopQuery): ProductSearchSortDto {
  switch (query.sort) {
    case 'price-asc':
      return 'price_asc';
    case 'price-desc':
      return 'price_desc';
    case 'newest':
      return 'createdAt_desc';
    case 'rating':
    case 'featured':
      return query.q ? 'relevance' : 'createdAt_desc';
  }
}

export function toSearchProductsQuery(
  query: ShopQuery,
  categories: readonly CategoryDto[],
): SearchProductsQuery {
  return {
    q: query.q,
    categoryId: resolveShopCategoryId(query, categories),
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    status: 'published',
    sort: toSearchSort(query),
    page: query.page,
    pageSize: SHOP_PAGE_SIZE,
  };
}
