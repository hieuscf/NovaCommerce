export interface CategoryResponseDto {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly parentId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
