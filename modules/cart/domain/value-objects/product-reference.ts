import { ValueObject } from '@novacommerce/building-blocks';
import { CartDomainError } from '../errors/cart-domain.error';

export class ProductReference extends ValueObject<{ productId: string; variantId?: string }> {
  private constructor(props: { productId: string; variantId?: string }) {
    super(props);
  }

  static create(productId: string, variantId?: string): ProductReference {
    if (!productId?.trim()) {
      throw new CartDomainError('Product id is required', 'INVALID_PRODUCT_REFERENCE');
    }
    return new ProductReference({
      productId: productId.trim(),
      variantId: variantId?.trim(),
    });
  }

  get productId(): string { return this.props.productId; }
  get variantId(): string | undefined { return this.props.variantId; }
}
