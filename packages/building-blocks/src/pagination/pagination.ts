export interface PaginationRequest {
  readonly page: number;
  readonly pageSize: number;
}

export interface PaginationMeta {
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly meta: PaginationMeta;
}

export function createPaginationMeta(
  request: PaginationRequest,
  totalItems: number,
): PaginationMeta {
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / request.pageSize);
  return {
    page: request.page,
    pageSize: request.pageSize,
    totalItems,
    totalPages,
    hasNextPage: request.page < totalPages,
    hasPreviousPage: request.page > 1 && totalPages > 0,
  };
}
