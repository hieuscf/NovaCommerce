import { ValueObject } from '@novacommerce/building-blocks';
import { CatalogDomainError } from '../errors/catalog-domain.error';

export class ProductSlug extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }

  static create(value: string): ProductSlug {
    const trimmed = value?.trim();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed)) throw new CatalogDomainError('Invalid product slug', 'INVALID_PRODUCT_SLUG');
    return new ProductSlug({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
