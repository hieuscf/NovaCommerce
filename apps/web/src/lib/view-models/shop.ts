import type { ShopQuery } from '@/lib/url/shop-query';

export const SHOP_PAGE_SIZE = 12;

export const SHOP_SORTS = ['featured', 'price-asc', 'price-desc', 'newest', 'rating'] as const;

export type ShopSort = (typeof SHOP_SORTS)[number];

export const SHOP_SORT_LABELS: Record<ShopSort, string> = {
  featured: 'Featured',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
  newest: 'Newest',
  rating: 'Best Rating',
};

export interface ShopFacetOption {
  readonly slug: string;
  readonly name: string;
}

export interface ShopFacets {
  readonly categories: readonly ShopFacetOption[];
  readonly brands: readonly ShopFacetOption[];
}

export interface ShopCrumb {
  readonly href: string;
  readonly label: string;
  readonly current?: boolean;
}

export interface ShopHeaderViewModel {
  readonly title: string;
  readonly description: string;
  readonly crumbs: readonly ShopCrumb[];
}

export interface ShopCollection {
  readonly name: string;
  readonly description: string;
  readonly parent?: ShopFacetOption;
}

const SHOP_COLLECTIONS: Record<string, ShopCollection> = {
  electronics: {
    name: 'Electronics',
    description: 'Premium devices and accessories from leading brands.',
  },
  smartphones: {
    name: 'Smartphones',
    description: 'Discover the latest smartphones from leading brands.',
    parent: { slug: 'electronics', name: 'Electronics' },
  },
  laptops: {
    name: 'Laptops',
    description: 'Thin, powerful notebooks for work and creation.',
    parent: { slug: 'electronics', name: 'Electronics' },
  },
  tablets: {
    name: 'Tablets',
    description: 'Portable canvases for notes, media, and design.',
    parent: { slug: 'electronics', name: 'Electronics' },
  },
  accessories: {
    name: 'Accessories',
    description: 'Headphones, watches, and everyday tech extras.',
    parent: { slug: 'electronics', name: 'Electronics' },
  },
  fashion: {
    name: 'Fashion',
    description: 'Seasonal essentials with a quiet luxury feel.',
  },
  'home-living': {
    name: 'Home & Living',
    description: 'Calm, considered pieces for everyday spaces.',
  },
  'beauty-health': {
    name: 'Beauty & Health',
    description: 'Thoughtful self-care from trusted makers.',
  },
  'sports-outdoors': {
    name: 'Sports & Outdoors',
    description: 'Gear that keeps up with the next outing.',
  },
  'toys-games': {
    name: 'Toys & Games',
    description: 'Playful picks for kids and collectors.',
  },
};

export function getShopCollection(slug: string | undefined): ShopCollection | undefined {
  if (!slug) {
    return undefined;
  }
  return SHOP_COLLECTIONS[slug];
}

export function getShopHeader(query: ShopQuery): ShopHeaderViewModel {
  const selected = query.categories;
  const collection = selected.length === 1 ? SHOP_COLLECTIONS[selected[0] ?? ''] : undefined;

  if (collection && selected[0]) {
    const crumbs: ShopCrumb[] = [
      { href: '/', label: 'Home' },
      { href: '/shop', label: 'Shop' },
    ];
    if (collection.parent) {
      crumbs.push({
        href: `/shop?category=${collection.parent.slug}`,
        label: collection.parent.name,
      });
    }
    crumbs.push({ href: `/shop?category=${selected[0]}`, label: collection.name, current: true });
    return {
      title: collection.name,
      description: collection.description,
      crumbs,
    };
  }

  if (selected.length > 1) {
    return {
      title: 'Filtered products',
      description: 'Products matching the selected categories.',
      crumbs: [
        { href: '/', label: 'Home' },
        { href: '/shop', label: 'Shop', current: true },
      ],
    };
  }

  return {
    title: 'All products',
    description: 'Browse the NovaCommerce catalog.',
    crumbs: [
      { href: '/', label: 'Home' },
      { href: '/shop', label: 'Shop', current: true },
    ],
  };
}

export function formatResultRange({
  total,
  page,
  pageSize,
}: {
  total: number;
  page: number;
  pageSize: number;
}): string {
  if (total <= 0) {
    return '0 results';
  }

  if (total === 1) {
    return '1 result';
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  if (from === 1 && to === total) {
    return `${total} results`;
  }

  return `${from}–${to} of ${total}`;
}
