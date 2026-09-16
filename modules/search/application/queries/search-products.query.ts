export interface SearchProductsQuery {
  readonly query?: string;
  readonly categoryId?: string;
  readonly brandId?: string;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly status?: string;
  readonly sort?: string;
  readonly page?: number;
  readonly pageSize?: number;
}
