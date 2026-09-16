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

/**
 * Seller onboarding status for `/seller`.
 *
 * The Seller bounded context is deferred (`docs/domain-model.md`), so this
 * always returns `unregistered` until a Seller Gateway adapter exists.
 * Do not invent Seller APIs from the storefront.
 */
export function getSellerPageStatus(): SellerPageStatus {
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
