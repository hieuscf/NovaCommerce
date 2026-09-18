import {
  sellerBusinessTypes,
  sellerCities,
  sellerDialCodes,
  sellerSellingModels,
  sellerShopCategories,
  sellerStates,
  sellerTermsSections,
  sellerVerificationDocuments,
} from '@/lib/mock-data/seller';
import type { SellerPageStatus, SellerPageViewModel } from '@/lib/view-models/seller';

export type SellerPageSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/**
 * Seller onboarding / workspace status for `/seller`.
 *
 * The Seller bounded context is deferred (`docs/domain-model.md`), so the
 * default remains `unregistered` until a Seller Gateway adapter exists.
 * `?demo=registered` is a presentation-only preview of the verified seller
 * dashboard — it does not invent Seller APIs.
 */
export function getSellerPageStatus(
  searchParams?: SellerPageSearchParams,
): SellerPageStatus {
  const demo = first(searchParams?.demo)?.trim().toLowerCase();
  if (demo === 'registered') return 'registered';
  return 'unregistered';
}

export function getSellerPage(
  status: SellerPageStatus = getSellerPageStatus(),
): SellerPageViewModel {
  return {
    status,
    businessTypes: sellerBusinessTypes,
    cities: sellerCities,
    states: sellerStates,
    dialCodes: sellerDialCodes,
    shopCategories: sellerShopCategories,
    sellingModels: sellerSellingModels,
    verificationDocuments: sellerVerificationDocuments,
    termsSections: sellerTermsSections,
  };
}
