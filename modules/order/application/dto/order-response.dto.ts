export interface OrderLineResponseDto {
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

export interface OrderResponseDto {
  readonly id: string;
  readonly orderNumber: string;
  readonly customerId: string;
  readonly status: string;
  readonly totalAmount: number;
  readonly totalCurrency: string;
  readonly lines: readonly OrderLineResponseDto[];
  readonly lineCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface OrderListResponseDto {
  readonly items: OrderResponseDto[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}
