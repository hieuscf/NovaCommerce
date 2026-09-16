import type { ShopCrumb } from '@/lib/view-models/shop';
import { getShopCollection } from '@/lib/view-models/shop';
import { productHref, type ProductViewModel } from '@/lib/view-models/product';

export type ProductAvailability = 'in_stock' | 'out_of_stock';

export interface ProductImageViewModel {
  readonly id: string;
  readonly url: string;
  readonly alt: string;
}

export type ProductVariantControl = 'swatch' | 'button';

export interface ProductVariantOptionViewModel {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly available: boolean;
  readonly swatch?: string;
  readonly imageId?: string;
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

export interface ProductTrustItemViewModel {
  readonly id: string;
  readonly label: string;
  readonly icon: 'shipping' | 'secure' | 'returns';
}

export interface ProductDetailViewModel {
  readonly product: ProductViewModel;
  readonly shortDescription: string;
  readonly description: string;
  readonly images: readonly ProductImageViewModel[];
  readonly variants: readonly ProductVariantGroupViewModel[];
  readonly availability: ProductAvailability;
  readonly specifications: readonly ProductSpecViewModel[];
  readonly features: readonly ProductFeatureViewModel[];
  readonly reviews: readonly ProductReviewViewModel[];
  readonly ratingDistribution: ProductRatingDistribution;
  readonly crumbs: readonly ShopCrumb[];
  readonly related: readonly ProductViewModel[];
  readonly trustItems: readonly ProductTrustItemViewModel[];
}

export const DEFAULT_TRUST_ITEMS: readonly ProductTrustItemViewModel[] = [
  { id: 'shipping', label: 'Free shipping', icon: 'shipping' },
  { id: 'secure', label: 'Secure payment', icon: 'secure' },
  { id: 'returns', label: 'Easy returns', icon: 'returns' },
];

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
