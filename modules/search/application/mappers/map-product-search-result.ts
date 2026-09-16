import { createPaginationMeta } from '@novacommerce/building-blocks';
import type { ProductSearchDocument } from '../../domain/entities/product-search-document';
import type { ProductSearchItemDto, SearchProductsResult } from '../dto/product-search-result.dto';

export function mapProductSearchDocumentToItem(document: ProductSearchDocument): ProductSearchItemDto {
  return {
    id: document.id,
    slug: document.slug,
    name: document.name,
    description: document.description,
    status: document.status,
    brand: document.brand,
    categories: document.categories,
    price: document.price,
    currency: document.currency,
    images: document.images,
    attributes: document.attributes,
    tags: document.tags,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

export function mapProductSearchHitsToResult(
  documents: readonly ProductSearchDocument[],
  total: number,
  page: number,
  pageSize: number,
): SearchProductsResult {
  const meta = createPaginationMeta({ page, pageSize }, total);

  return {
    items: documents.map(mapProductSearchDocumentToItem),
    total,
    page,
    pageSize,
    totalPages: meta.totalPages,
  };
}
