import type { ProductSearchDocument } from '../entities/product-search-document';
import type { ProductSearchCriteria, ProductSearchHits } from '../queries/product-search-criteria';

/**
 * Product search index port. Application depends on this abstraction — never on
 * an OpenSearch client. Search does not query PostgreSQL.
 */
export interface IProductSearchIndex {
  ensureIndex(): Promise<void>;
  indexDocument(document: ProductSearchDocument): Promise<void>;
  updateDocument(document: ProductSearchDocument): Promise<void>;
  deleteDocument(productId: string): Promise<void>;
  search(criteria: ProductSearchCriteria): Promise<ProductSearchHits>;
}
