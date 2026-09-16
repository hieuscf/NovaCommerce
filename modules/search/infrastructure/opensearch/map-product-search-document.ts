import type { ProductSearchDocument } from '../../domain/entities/product-search-document';

export function mapProductSearchDocumentToSource(
  document: ProductSearchDocument,
): Record<string, unknown> {
  return {
    id: document.id,
    slug: document.slug,
    name: document.name,
    description: document.description,
    status: document.status,
    brand: document.brand,
    categories: [...document.categories],
    price: document.price,
    currency: document.currency,
    images: [...document.images],
    attributes: [...document.attributes],
    tags: [...document.tags],
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}
