import { ValueObject } from '@novacommerce/building-blocks';
import { CatalogDomainError } from '../errors/catalog-domain.error';

export class ProductName extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }

  static create(value: string): ProductName {
    const trimmed = value?.trim();
    if (!trimmed || trimmed.length > 200) throw new CatalogDomainError('Invalid product name', 'INVALID_PRODUCT_NAME');
    return new ProductName({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
