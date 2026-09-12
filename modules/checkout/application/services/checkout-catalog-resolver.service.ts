import type { IProductRepository } from '../../../catalog/domain/repositories/i-product-repository';
import { CheckoutApplicationError } from '../errors/checkout-application.error';

export interface ResolvedCheckoutLineSku {
  readonly productId: string;
  readonly variantId?: string;
  readonly sku: string;
}

export async function resolveSkuForCartItem(
  productRepository: IProductRepository,
  productId: string,
  variantId?: string,
): Promise<ResolvedCheckoutLineSku | CheckoutApplicationError> {
  const product = await productRepository.findById(productId);
  if (!product) {
    return new CheckoutApplicationError('Product not found', 'PRODUCT_NOT_FOUND');
  }

  const variants = product.getVariants();
  if (variantId) {
    const variant = variants.find((item) => item.id === variantId);
    if (!variant) {
      return new CheckoutApplicationError('Product variant not found', 'PRODUCT_VARIANT_NOT_FOUND');
    }
    return { productId, variantId, sku: variant.getSku().value };
  }

  if (variants.length === 1) {
    return { productId, variantId: variants[0]?.id, sku: variants[0]!.getSku().value };
  }

  return new CheckoutApplicationError('Product variant is required for checkout', 'PRODUCT_VARIANT_REQUIRED');
}
