import type { ShopQuery, ShopRating } from '@/lib/url/shop-query';

export const SHOP_PAGE_SIZE = 12;

export const SHOP_PRICE_MAX = 5000;

export const SHOP_SORTS = ['featured', 'price-asc', 'price-desc', 'newest', 'rating'] as const;

export type ShopSort = (typeof SHOP_SORTS)[number];

export const SHOP_SORT_LABELS: Record<ShopSort, string> = {
  featured: 'Featured',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
  newest: 'Newest',
  rating: 'Best Rating',
};

export const SHOP_RATING_OPTIONS: readonly ShopRating[] = [5, 4, 3, 2];

export interface ShopFacetOption {
  readonly slug: string;
  readonly name: string;
  readonly count?: number;
}

export interface ShopRatingFacet {
  readonly value: ShopRating;
  readonly count: number;
}

export interface ShopFacets {
  readonly categories: readonly ShopFacetOption[];
  readonly brands: readonly ShopFacetOption[];
  readonly ratings?: readonly ShopRatingFacet[];
  readonly inStockCount?: number;
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
    description:
      'Discover the latest electronics, from smartphones and laptops to smart home devices and accessories.',
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

export function isShopCollectionSlug(slug: string): boolean {
  return slug in SHOP_COLLECTIONS;
}

export function listShopCollectionSlugs(): string[] {
  return Object.keys(SHOP_COLLECTIONS);
}

export function shopCollectionHref(slug: string): string {
  return `/shop/${slug}`;
}

export function getShopChildCollections(parentSlug: string): ShopFacetOption[] {
  return Object.entries(SHOP_COLLECTIONS)
    .filter(([, collection]) => collection.parent?.slug === parentSlug)
    .map(([slug, collection]) => ({ slug, name: collection.name }));
}

export function getShopRootCollections(): ShopFacetOption[] {
  return Object.entries(SHOP_COLLECTIONS)
    .filter(([, collection]) => !collection.parent)
    .map(([slug, collection]) => ({ slug, name: collection.name }));
}

function collectionSlugForHeader(query: ShopQuery): string | undefined {
  if (query.collection) {
    return query.collection;
  }
  if (query.categories.length === 1) {
    return query.categories[0];
  }
  return undefined;
}

export function getShopHeader(query: ShopQuery): ShopHeaderViewModel {
  const selected = collectionSlugForHeader(query);
  const collection = selected ? SHOP_COLLECTIONS[selected] : undefined;

  if (collection && selected) {
    const crumbs: ShopCrumb[] = [
      { href: '/', label: 'Home' },
      { href: '/shop', label: 'Shop' },
    ];
    if (collection.parent) {
      crumbs.push({
        href: shopCollectionHref(collection.parent.slug),
        label: collection.parent.name,
      });
    }
    crumbs.push({ href: shopCollectionHref(selected), label: collection.name, current: true });
    return {
      title: collection.name,
      description: collection.description,
      crumbs,
    };
  }

  if (query.categories.length > 1) {
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
    title: 'Shop',
    description: 'Discover the latest products, from everyday essentials to flagship devices.',
    crumbs: [
      { href: '/', label: 'Home' },
      { href: '/shop', label: 'Shop', current: true },
    ],
  };
}

export function formatProductCount(total: number): string {
  const formatted = new Intl.NumberFormat('en-US').format(total);
  return total === 1 ? '1 product' : `${formatted} products`;
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

export function formatPriceBound(amount: number, max = SHOP_PRICE_MAX): string {
  if (amount >= max) {
    return `$${max.toLocaleString('en-US')}+`;
  }
  return `$${amount.toLocaleString('en-US')}`;
}
