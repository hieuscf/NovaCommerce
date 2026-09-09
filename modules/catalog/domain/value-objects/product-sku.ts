import { ValueObject } from '@novacommerce/building-blocks';
import { CatalogDomainError } from '../errors/catalog-domain.error';

export class ProductSku extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }

  static create(value: string): ProductSku {
    const trimmed = value?.trim();
    if (!trimmed) throw new CatalogDomainError('SKU is required', 'INVALID_SKU');
    return new ProductSku({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
