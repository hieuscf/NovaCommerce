import { Result } from '@novacommerce/building-blocks';
import { ProductSearchDocument } from '../../domain/entities/product-search-document';
import { SearchDomainError } from '../../domain/errors/search-domain.error';
import type { ProductSearchIndexContract } from '../contracts/product-search-event.contract';

export function mapProductSearchContractToDocument(
  contract: ProductSearchIndexContract,
): Result<ProductSearchDocument, SearchDomainError> {
  return ProductSearchDocument.create({
    id: contract.productId,
    slug: contract.slug,
    name: contract.name,
    description: contract.description,
    status: contract.status,
    brand: contract.brand,
    categories: contract.categories,
    price: contract.price,
    currency: contract.currency,
    images: contract.images,
    attributes: contract.attributes,
    tags: contract.tags,
    createdAt: contract.createdAt,
    updatedAt: contract.updatedAt,
  });
}
