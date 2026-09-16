import { Result } from '@novacommerce/building-blocks';
import { SearchDomainError } from '../errors/search-domain.error';

export const PRODUCT_SEARCH_STATUSES = ['draft', 'published', 'archived'] as const;

export type ProductSearchStatus = (typeof PRODUCT_SEARCH_STATUSES)[number];

export interface ProductSearchBrand {
  readonly id: string;
  readonly name: string;
}

export interface ProductSearchCategory {
  readonly id: string;
  readonly name: string;
}

export interface ProductSearchAttribute {
  readonly name: string;
  readonly value: string;
}

export interface ProductSearchDocumentProps {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly description?: string;
  readonly status: ProductSearchStatus;
  readonly brand?: ProductSearchBrand;
  readonly categories?: readonly ProductSearchCategory[];
  readonly price: number;
  readonly currency: string;
  readonly images?: readonly string[];
  readonly attributes?: readonly ProductSearchAttribute[];
  readonly tags?: readonly string[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

function isProductSearchStatus(value: string): value is ProductSearchStatus {
  return (PRODUCT_SEARCH_STATUSES as readonly string[]).includes(value);
}

function requireTrimmed(value: string | undefined, field: string, code: string): Result<string, SearchDomainError> {
  const trimmed = value?.trim();
  if (!trimmed) {
    return Result.fail(new SearchDomainError(`${field} is required`, code));
  }

  return Result.ok(trimmed);
}

/**
 * Search read-model document. This is not a Catalog Product entity and is not a
 * transactional aggregate. Catalog remains the source of truth.
 */
export class ProductSearchDocument {
  private constructor(
    readonly id: string,
    readonly slug: string,
    readonly name: string,
    readonly description: string | undefined,
    readonly status: ProductSearchStatus,
    readonly brand: ProductSearchBrand | undefined,
    readonly categories: readonly ProductSearchCategory[],
    readonly price: number,
    readonly currency: string,
    readonly images: readonly string[],
    readonly attributes: readonly ProductSearchAttribute[],
    readonly tags: readonly string[],
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: ProductSearchDocumentProps): Result<ProductSearchDocument, SearchDomainError> {
    const idResult = requireTrimmed(props.id, 'id', 'INVALID_PRODUCT_SEARCH_ID');
    if (idResult.isFailure) {
      return Result.fail(idResult.getError());
    }

    const slugResult = requireTrimmed(props.slug, 'slug', 'INVALID_PRODUCT_SEARCH_SLUG');
    if (slugResult.isFailure) {
      return Result.fail(slugResult.getError());
    }

    const nameResult = requireTrimmed(props.name, 'name', 'INVALID_PRODUCT_SEARCH_NAME');
    if (nameResult.isFailure) {
      return Result.fail(nameResult.getError());
    }

    if (!isProductSearchStatus(props.status)) {
      return Result.fail(new SearchDomainError('Invalid product search status', 'INVALID_PRODUCT_SEARCH_STATUS'));
    }

    if (!Number.isFinite(props.price) || props.price < 0) {
      return Result.fail(
        new SearchDomainError('Price must be a non-negative finite number', 'INVALID_PRODUCT_SEARCH_PRICE'),
      );
    }

    const currency = props.currency?.trim().toUpperCase();
    if (!currency || currency.length !== 3) {
      return Result.fail(
        new SearchDomainError('Currency must be a 3-letter ISO code', 'INVALID_PRODUCT_SEARCH_CURRENCY'),
      );
    }

    if (!(props.createdAt instanceof Date) || Number.isNaN(props.createdAt.getTime())) {
      return Result.fail(new SearchDomainError('createdAt must be a valid date', 'INVALID_PRODUCT_SEARCH_CREATED_AT'));
    }

    if (!(props.updatedAt instanceof Date) || Number.isNaN(props.updatedAt.getTime())) {
      return Result.fail(new SearchDomainError('updatedAt must be a valid date', 'INVALID_PRODUCT_SEARCH_UPDATED_AT'));
    }

    const description = props.description?.trim() || undefined;
    const brand = normalizeBrand(props.brand);
    if (brand instanceof SearchDomainError) {
      return Result.fail(brand);
    }

    const categories = normalizeCategories(props.categories);
    if (categories instanceof SearchDomainError) {
      return Result.fail(categories);
    }

    const images = (props.images ?? []).map((image) => image.trim()).filter((image) => image.length > 0);
    const attributes = normalizeAttributes(props.attributes);
    if (attributes instanceof SearchDomainError) {
      return Result.fail(attributes);
    }

    const tags = (props.tags ?? []).map((tag) => tag.trim()).filter((tag) => tag.length > 0);

    return Result.ok(
      new ProductSearchDocument(
        idResult.getValue(),
        slugResult.getValue(),
        nameResult.getValue(),
        description,
        props.status,
        brand,
        categories,
        props.price,
        currency,
        images,
        attributes,
        tags,
        props.createdAt,
        props.updatedAt,
      ),
    );
  }
}

function normalizeBrand(
  brand: ProductSearchBrand | undefined,
): ProductSearchBrand | undefined | SearchDomainError {
  if (!brand) {
    return undefined;
  }

  const id = brand.id?.trim();
  const name = brand.name?.trim();
  if (!id || !name) {
    return new SearchDomainError('Brand requires id and name', 'INVALID_PRODUCT_SEARCH_BRAND');
  }

  return { id, name };
}

function normalizeCategories(
  categories: readonly ProductSearchCategory[] | undefined,
): readonly ProductSearchCategory[] | SearchDomainError {
  const result: ProductSearchCategory[] = [];

  for (const category of categories ?? []) {
    const id = category.id?.trim();
    const name = category.name?.trim();
    if (!id || !name) {
      return new SearchDomainError('Category requires id and name', 'INVALID_PRODUCT_SEARCH_CATEGORY');
    }

    result.push({ id, name });
  }

  return result;
}

function normalizeAttributes(
  attributes: readonly ProductSearchAttribute[] | undefined,
): readonly ProductSearchAttribute[] | SearchDomainError {
  const result: ProductSearchAttribute[] = [];

  for (const attribute of attributes ?? []) {
    const name = attribute.name?.trim();
    const value = attribute.value?.trim();
    if (!name || !value) {
      return new SearchDomainError('Attribute requires name and value', 'INVALID_PRODUCT_SEARCH_ATTRIBUTE');
    }

    result.push({ name, value });
  }

  return result;
}
