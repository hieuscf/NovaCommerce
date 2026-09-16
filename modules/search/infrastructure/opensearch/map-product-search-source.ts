import { Result } from '@novacommerce/building-blocks';
import { ProductSearchDocument, type ProductSearchStatus } from '../../domain/entities/product-search-document';
import { SearchDomainError } from '../../domain/errors/search-domain.error';

export function mapProductSearchSourceToDocument(
  source: Record<string, unknown>,
  fallbackId?: string,
): Result<ProductSearchDocument, SearchDomainError> {
  const createdAt = parseDate(source.createdAt);
  const updatedAt = parseDate(source.updatedAt);

  if (!createdAt || !updatedAt) {
    return Result.fail(
      new SearchDomainError('Search hit is missing valid timestamps', 'INVALID_PRODUCT_SEARCH_HIT'),
    );
  }

  const id = readString(source.id) ?? fallbackId;
  if (!id) {
    return Result.fail(new SearchDomainError('Search hit is missing id', 'INVALID_PRODUCT_SEARCH_HIT'));
  }

  return ProductSearchDocument.create({
    id,
    slug: readString(source.slug) ?? '',
    name: readString(source.name) ?? '',
    description: readString(source.description),
    status: (readString(source.status) ?? '') as ProductSearchStatus,
    brand: readBrand(source.brand),
    categories: readCategories(source.categories),
    price: typeof source.price === 'number' ? source.price : Number.NaN,
    currency: readString(source.currency) ?? '',
    images: readStringArray(source.images),
    attributes: readAttributes(source.attributes),
    tags: readStringArray(source.tags),
    createdAt,
    updatedAt,
  });
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function readBrand(value: unknown): { id: string; name: string } | undefined {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }

  const record = value as { id?: unknown; name?: unknown };
  const id = readString(record.id);
  const name = readString(record.name);
  if (!id || !name) {
    return undefined;
  }

  return { id, name };
}

function readCategories(value: unknown): { id: string; name: string }[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const categories: { id: string; name: string }[] = [];
  for (const item of value) {
    const category = readBrand(item);
    if (category) {
      categories.push(category);
    }
  }

  return categories;
}

function readAttributes(value: unknown): { name: string; value: string }[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const attributes: { name: string; value: string }[] = [];
  for (const item of value) {
    if (typeof item !== 'object' || item === null) {
      continue;
    }

    const record = item as { name?: unknown; value?: unknown };
    const name = readString(record.name);
    const attributeValue = readString(record.value);
    if (name && attributeValue) {
      attributes.push({ name, value: attributeValue });
    }
  }

  return attributes;
}

function parseDate(value: unknown): Date | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return undefined;
}
