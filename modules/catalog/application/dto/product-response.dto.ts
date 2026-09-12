export interface ProductVariantResponseDto {
  readonly id: string;
  readonly sku: string;
  readonly priceAmount: number;
  readonly priceCurrency: string;
  readonly attributes: Record<string, string>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProductImageResponseDto {
  readonly id: string;
  readonly url: string;
  readonly sortOrder: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProductAttributeResponseDto {
  readonly id: string;
  readonly name: string;
  readonly value: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProductOptionResponseDto {
  readonly id: string;
  readonly name: string;
  readonly values: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProductResponseDto {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly basePriceAmount: number;
  readonly basePriceCurrency: string;
  readonly status: string;
  readonly categoryId?: string;
  readonly variants: ProductVariantResponseDto[];
  readonly images: ProductImageResponseDto[];
  readonly attributes: ProductAttributeResponseDto[];
  readonly options: ProductOptionResponseDto[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProductListResponseDto {
  readonly items: ProductResponseDto[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}
