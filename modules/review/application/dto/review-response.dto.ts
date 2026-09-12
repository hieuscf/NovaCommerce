export interface ReviewMediaResponseDto {
  readonly id: string;
  readonly url: string;
  readonly mediaType: string;
  readonly createdAt: string;
}

export interface ReviewResponseDto {
  readonly id: string;
  readonly productId: string;
  readonly variantId?: string;
  readonly customerId: string;
  readonly rating: number;
  readonly text: string;
  readonly status: string;
  readonly media: readonly ReviewMediaResponseDto[];
  readonly createdAt: string;
  readonly updatedAt: string;
}
