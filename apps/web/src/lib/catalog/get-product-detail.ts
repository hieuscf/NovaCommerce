import { catalogProducts } from '@/lib/mock-data/catalog';
import { productDetailExtras } from '@/lib/mock-data/product-detail';
import type { ProductViewModel } from '@/lib/view-models/product';
import {
  DEFAULT_TRUST_ITEMS,
  getProductBreadcrumbs,
  type ProductDetailViewModel,
  type ProductFeatureViewModel,
  type ProductImageViewModel,
  type ProductRatingDistribution,
  type ProductReviewViewModel,
  type ProductSpecViewModel,
} from '@/lib/view-models/product-detail';

const RELATED_LIMIT = 4;

const CATEGORY_GALLERY: Record<string, readonly string[]> = {
  smartphones: [
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1200&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&h=1200&fit=crop',
  ],
  laptops: [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1200&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&h=1200&fit=crop',
  ],
  tablets: [
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1200&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=1200&h=1200&fit=crop',
  ],
  accessories: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1200&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=1200&h=1200&fit=crop',
  ],
  fashion: [
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=1200&fit=crop',
  ],
  'sports-outdoors': [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1601925260368-ae2f1c127b6d?w=1200&h=1200&fit=crop',
  ],
  'home-living': [
    'https://images.unsplash.com/photo-1507473883500-ef308e1e2e1f?w=1200&h=1200&fit=crop',
  ],
  'beauty-health': [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=1200&fit=crop',
  ],
  'toys-games': [
    'https://images.unsplash.com/photo-1558060370-d644479cb6d2?w=1200&h=1200&fit=crop',
  ],
};

function fallbackImages(product: ProductViewModel): ProductImageViewModel[] {
  const extras = (product.categorySlug ? CATEGORY_GALLERY[product.categorySlug] : undefined) ?? [];
  const urls = [product.imageUrl, ...extras.filter((url) => url !== product.imageUrl)].slice(0, 4);

  return urls.map((url, index) => ({
    id: `${product.id}-image-${index + 1}`,
    url,
    alt: index === 0 ? `${product.name} — product photo` : `${product.name} — view ${index + 1}`,
  }));
}

function fallbackDescription(product: ProductViewModel): { short: string; full: string } {
  const short = `${product.brand} ${product.name} is presented here for storefront review. Select options, then add the product to your cart when you are ready.`;
  const full = `${product.name} is part of the NovaCommerce catalog presentation. ${
    product.variant ? `The highlighted configuration is ${product.variant}. ` : ''
  }Full merchandising copy, specifications, and live availability will come from the Catalog Gateway when that contract is wired.\n\nUntil then, this page uses fixture content so layout, gallery, and purchase controls can be designed independently of inventory and checkout.`;

  return { short, full };
}

function fallbackSpecs(product: ProductViewModel): ProductSpecViewModel[] {
  const specs: ProductSpecViewModel[] = [
    { name: 'Brand', value: product.brand },
    { name: 'Model', value: product.name },
  ];
  if (product.variant) {
    specs.push({ name: 'Highlighted option', value: product.variant });
  }
  if (product.categorySlug) {
    specs.push({ name: 'Category', value: product.categorySlug.replace(/-/g, ' ') });
  }
  return specs;
}

function fallbackFeatures(product: ProductViewModel): ProductFeatureViewModel[] {
  return [
    {
      title: 'Trusted brand',
      description: `${product.brand} products in this catalog are shown with consistent photography and pricing.`,
    },
    {
      title: 'Clear details',
      description: 'Specifications and photos stay on this page so you can compare before you buy.',
    },
    {
      title: 'Straightforward purchase',
      description: 'Add to cart when the item is in stock, or request a restock notice when it is not.',
    },
    {
      title: 'Easy returns',
      description: 'Storefront trust indicators match the rest of NovaCommerce — quiet, not noisy.',
    },
  ];
}

function fallbackReviews(product: ProductViewModel): ProductReviewViewModel[] {
  if (product.reviewCount <= 0) {
    return [];
  }

  return [
    {
      id: `${product.id}-review-1`,
      author: 'Alex J.',
      rating: Math.min(5, Math.max(4, Math.round(product.rating))),
      title: 'As described',
      content: `${product.name} arrived as shown. Build quality matches the listing photos.`,
      dateLabel: '1 week ago',
      verified: true,
      helpfulCount: 3,
    },
  ];
}

function fallbackDistribution(product: ProductViewModel): ProductRatingDistribution {
  const total = Math.max(product.reviewCount, 1);
  const five = Math.round(total * (product.rating / 5) * 0.72);
  const four = Math.round(total * 0.18);
  const three = Math.round(total * 0.06);
  const two = Math.round(total * 0.03);
  const one = Math.max(0, total - five - four - three - two);

  return { 5: five, 4: four, 3: three, 2: two, 1: one };
}

function relatedProducts(product: ProductViewModel): ProductViewModel[] {
  const sameCategory = catalogProducts.filter(
    (item) => item.id !== product.id && item.categorySlug === product.categorySlug,
  );
  const sameDepartment = catalogProducts.filter(
    (item) =>
      item.id !== product.id &&
      item.departmentSlug === product.departmentSlug &&
      !sameCategory.some((match) => match.id === item.id),
  );

  return [...sameCategory, ...sameDepartment].slice(0, RELATED_LIMIT);
}

/**
 * Presentation lookup for the PDP. Replace with a Catalog Gateway adapter later.
 * Does not encode inventory, pricing, or checkout rules.
 * Unknown slugs return `undefined` (route `not-found`). Unexpected load failures must throw
 * so `products/[slug]/error.tsx` can render `ErrorState`.
 */
export function getProductDetailBySlug(slug: string): ProductDetailViewModel | undefined {
  const product = catalogProducts.find((item) => item.slug === slug);
  if (!product) {
    return undefined;
  }

  const extras = productDetailExtras[slug];
  const copy = fallbackDescription(product);
  const availability = product.inStock === false ? 'out_of_stock' : 'in_stock';

  return {
    product,
    shortDescription: extras?.shortDescription ?? copy.short,
    description: extras?.description ?? copy.full,
    images: extras?.images ?? fallbackImages(product),
    variants: extras?.variants ?? [],
    availability,
    specifications: extras?.specifications ?? fallbackSpecs(product),
    features: extras?.features ?? fallbackFeatures(product),
    reviews: extras?.reviews ?? fallbackReviews(product),
    ratingDistribution: extras?.ratingDistribution ?? fallbackDistribution(product),
    crumbs: getProductBreadcrumbs(product),
    related: relatedProducts(product),
    trustItems: DEFAULT_TRUST_ITEMS,
  };
}

export function listProductSlugs(): readonly string[] {
  return catalogProducts.map((product) => product.slug);
}
