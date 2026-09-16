export type SearchHealthStatus = 'green' | 'yellow' | 'red' | 'unknown';

export interface SearchHealthResult {
  readonly status: SearchHealthStatus;
  readonly clusterName?: string;
}

export interface SearchIndexDocumentInput {
  readonly index: string;
  readonly id: string;
  readonly document: Record<string, unknown>;
}

export interface SearchUpdateDocumentInput {
  readonly index: string;
  readonly id: string;
  readonly document: Record<string, unknown>;
}

export interface SearchDeleteDocumentInput {
  readonly index: string;
  readonly id: string;
}

export type SearchSortClause = string | Record<string, unknown>;

export interface SearchQueryInput {
  readonly index: string;
  readonly query: Record<string, unknown>;
  readonly from?: number;
  readonly size?: number;
  readonly sort?: readonly SearchSortClause[];
}

export interface SearchHit {
  readonly id: string;
  readonly score: number;
  readonly source: Record<string, unknown>;
}

export interface SearchResult {
  readonly total: number;
  readonly hits: readonly SearchHit[];
}

export interface ISearchClient {
  health(): Promise<SearchHealthResult>;
  indexExists(index: string): Promise<boolean>;
  createIndex(
    index: string,
    mappings?: Record<string, unknown>,
    settings?: Record<string, unknown>,
  ): Promise<void>;
  deleteIndex(index: string): Promise<void>;
  indexDocument(input: SearchIndexDocumentInput): Promise<void>;
  updateDocument(input: SearchUpdateDocumentInput): Promise<void>;
  deleteDocument(input: SearchDeleteDocumentInput): Promise<void>;
  search(input: SearchQueryInput): Promise<SearchResult>;
  ping(): Promise<void>;
}
