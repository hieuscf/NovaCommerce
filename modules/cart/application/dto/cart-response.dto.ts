export interface CartItemResponseDto {
  readonly id: string;
  readonly productId: string;
  readonly variantId?: string;
  readonly quantity: number;
  readonly unitPriceAmount: number;
  readonly unitPriceCurrency: string;
  readonly lineTotalAmount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CartResponseDto {
  readonly id: string;
  readonly customerId?: string;
  readonly items: readonly CartItemResponseDto[];
  readonly itemCount: number;
  readonly subtotalAmount: number;
  readonly currency?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
