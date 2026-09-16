import type { ProductViewModel } from '@/lib/view-models/product';
import { SHOP_PAGE_SIZE } from '@/lib/view-models/shop';
import type { ShopQuery } from '@/lib/url/shop-query';

/**
 * Client-side fixture selection for the listing UI.
 * Not a Catalog bounded-context rule — swap for a Gateway query later.
 * Zero matches are an empty result (`EmptyState`). Unexpected load failures must throw
 * so `shop/error.tsx` can render `ErrorState`.
 */
export function applyShopQuery(
  products: readonly ProductViewModel[],
  query: ShopQuery,
): {
  items: ProductViewModel[];
  total: number;
  page: number;
  totalPages: number;
} {
  const needle = query.q?.toLowerCase();

  const matched = products.filter((product) => {
    if (needle) {
      const haystack = `${product.name} ${product.brand} ${product.variant ?? ''}`.toLowerCase();
      if (!haystack.includes(needle)) {
        return false;
      }
    }

    if (query.collection) {
      const inCollection =
        product.categorySlug === query.collection || product.departmentSlug === query.collection;
      if (!inCollection) {
        return false;
      }
    }

    if (query.categories.length > 0) {
      const inCategory = query.categories.some(
        (slug) => product.categorySlug === slug || product.departmentSlug === slug,
      );
      if (!inCategory) {
        return false;
      }
    }

    if (query.brands.length > 0 && !query.brands.includes(product.brand)) {
      return false;
    }

    if (query.minPrice != null && product.price < query.minPrice) {
      return false;
    }

    if (query.maxPrice != null && product.price > query.maxPrice) {
      return false;
    }

    if (query.rating && product.rating < query.rating) {
      return false;
    }

    if (query.inStock && product.inStock === false) {
      return false;
    }

    if (query.sale && product.badge !== 'sale') {
      return false;
    }

    return true;
  });

  const sorted = [...matched].sort((left, right) => {
    switch (query.sort) {
      case 'price-asc':
        return left.price - right.price;
      case 'price-desc':
        return right.price - left.price;
      case 'newest':
        return (right.createdAt ?? '').localeCompare(left.createdAt ?? '');
      case 'rating':
        return right.rating - left.rating;
      default:
        return 0;
    }
  });

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / SHOP_PAGE_SIZE));
  const page = Math.min(query.page, totalPages);
  const start = (page - 1) * SHOP_PAGE_SIZE;

  return {
    items: sorted.slice(start, start + SHOP_PAGE_SIZE),
    total,
    page,
    totalPages: total === 0 ? 0 : totalPages,
  };
}
