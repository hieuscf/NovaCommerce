import type { ShopCrumb } from '@/lib/view-models/shop';
import { getShopCollection } from '@/lib/view-models/shop';
import { productHref, type ProductViewModel } from '@/lib/view-models/product';

export type ProductAvailability = 'in_stock' | 'out_of_stock';

export interface ProductImageViewModel {
  readonly id: string;
  readonly url: string;
  readonly alt: string;
}

export type ProductVariantControl = 'swatch' | 'button' | 'image';

export interface ProductVariantOptionViewModel {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly available: boolean;
  readonly swatch?: string;
  readonly imageId?: string;
  readonly thumbnailUrl?: string;
}

export interface ProductVariantGroupViewModel {
  readonly id: string;
  readonly name: string;
  readonly type: ProductVariantControl;
  readonly options: readonly ProductVariantOptionViewModel[];
}

export interface ProductSpecViewModel {
  readonly name: string;
  readonly value: string;
}

export interface ProductFeatureViewModel {
  readonly title: string;
  readonly description: string;
}

export interface ProductReviewViewModel {
  readonly id: string;
  readonly author: string;
  readonly rating: number;
  readonly title: string;
  readonly content: string;
  readonly dateLabel: string;
  readonly verified?: boolean;
  readonly helpfulCount?: number;
}

export interface ProductRatingDistribution {
  readonly 1: number;
  readonly 2: number;
  readonly 3: number;
  readonly 4: number;
  readonly 5: number;
}

export type ProductHighlightIcon =
  | 'chip'
  | 'memory'
  | 'display'
  | 'battery'
  | 'camera'
  | 'audio'
  | 'storage'
  | 'weight';

export interface ProductHighlightSpecViewModel {
  readonly id: string;
  readonly label: string;
  readonly hint: string;
  readonly icon: ProductHighlightIcon;
}

export interface ProductSellerViewModel {
  readonly name: string;
  readonly official: boolean;
  readonly rating: number;
  readonly reviewLabel: string;
  readonly href: string;
  readonly badges: readonly string[];
}

export interface ProductLifestyleViewModel {
  readonly url: string;
  readonly alt: string;
}

export interface ProductShippingViewModel {
  readonly heading: string;
  readonly paragraphs: readonly string[];
}

export interface ProductTrustItemViewModel {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly icon: 'shipping' | 'secure' | 'returns' | 'support';
}

export interface ProductDetailViewModel {
  readonly product: ProductViewModel;
  readonly shortDescription: string;
  readonly description: string;
  readonly descriptionTitle: string;
  readonly images: readonly ProductImageViewModel[];
  readonly variants: readonly ProductVariantGroupViewModel[];
  readonly availability: ProductAvailability;
  readonly highlightSpecs: readonly ProductHighlightSpecViewModel[];
  readonly specifications: readonly ProductSpecViewModel[];
  readonly features: readonly ProductFeatureViewModel[];
  readonly reviews: readonly ProductReviewViewModel[];
  readonly ratingDistribution: ProductRatingDistribution;
  readonly crumbs: readonly ShopCrumb[];
  readonly related: readonly ProductViewModel[];
  readonly trustItems: readonly ProductTrustItemViewModel[];
  readonly seller: ProductSellerViewModel;
  readonly lifestyleImage?: ProductLifestyleViewModel;
  readonly shippingReturns: ProductShippingViewModel;
}

export const DEFAULT_TRUST_ITEMS: readonly ProductTrustItemViewModel[] = [
  { id: 'shipping', label: 'Free Shipping', description: 'On orders over $50', icon: 'shipping' },
  { id: 'secure', label: 'Secure Payment', description: '100% protected', icon: 'secure' },
  { id: 'returns', label: 'Easy Returns', description: '30-day return policy', icon: 'returns' },
  { id: 'support', label: '24/7 Support', description: "We're here to help", icon: 'support' },
];

export const DEFAULT_PRODUCT_SELLER: ProductSellerViewModel = {
  name: 'NovaStore',
  official: true,
  rating: 4.8,
  reviewLabel: '12.5k+ reviews',
  href: '/shop',
  badges: ['100% Authentic Products', 'Fast & Reliable Shipping'],
};

export const DEFAULT_SHIPPING_RETURNS: ProductShippingViewModel = {
  heading: 'Shipping & Returns',
  paragraphs: [
    'Free shipping on qualifying orders. Delivery estimates appear at checkout once a shipping address is available.',
    'Most items can be returned within 30 days in original condition. Return labels and eligibility stay with Order and Fulfillment when those APIs are connected.',
  ],
};

export function getProductBreadcrumbs(product: ProductViewModel): ShopCrumb[] {
  const crumbs: ShopCrumb[] = [{ href: '/', label: 'Home' }];
  const department = getShopCollection(product.departmentSlug);
  const category = getShopCollection(product.categorySlug);
  const sameCollection = product.departmentSlug === product.categorySlug;

  if (department && product.departmentSlug && !sameCollection) {
    crumbs.push({
      href: `/shop/${product.departmentSlug}`,
      label: department.name,
    });
  }

  if (category && product.categorySlug) {
    crumbs.push({
      href: `/shop/${product.categorySlug}`,
      label: category.name,
    });
  } else {
    crumbs.push({ href: '/shop', label: 'Shop' });
  }

  crumbs.push({
    href: productHref(product.slug),
    label: product.name,
    current: true,
  });

  return crumbs;
}

export function getSelectedVariantLabel(
  variants: readonly ProductVariantGroupViewModel[],
  selected: Readonly<Record<string, string>>,
): string | undefined {
  const labels = variants
    .map((group) => {
      const optionId = selected[group.id];
      return group.options.find((option) => option.id === optionId)?.label;
    })
    .filter((label): label is string => Boolean(label));

  return labels.length > 0 ? labels.join(' · ') : undefined;
}

export function defaultVariantSelection(
  variants: readonly ProductVariantGroupViewModel[],
  hint?: string,
): Record<string, string> {
  const haystack = hint?.toLowerCase() ?? '';

  return Object.fromEntries(
    variants.map((group) => {
      const hinted = haystack
        ? group.options.find((option) => {
            if (!option.available) {
              return false;
            }
            const label = option.label.toLowerCase();
            const value = option.value.toLowerCase();
            return haystack.includes(label) || haystack.includes(value);
          })
        : undefined;
      const firstAvailable = group.options.find((option) => option.available) ?? group.options[0];
      return [group.id, hinted?.id ?? firstAvailable?.id ?? ''];
    }),
  );
}

export function ratingBarPercent(count: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.round((count / total) * 100);
}
