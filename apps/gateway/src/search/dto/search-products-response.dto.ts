import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiResponseMetaDto } from '../../common/dto/api-response-meta.dto';

export class ProductSearchBrandResponseDto {
  @ApiProperty({ example: '33333333-3333-3333-3333-333333333333' })
  id!: string;

  @ApiProperty({ example: 'Nova Audio' })
  name!: string;
}

export class ProductSearchCategoryResponseDto {
  @ApiProperty({ example: '44444444-4444-4444-4444-444444444444' })
  id!: string;

  @ApiProperty({ example: 'Headphones' })
  name!: string;
}

export class ProductSearchAttributeResponseDto {
  @ApiProperty({ example: 'color' })
  name!: string;

  @ApiProperty({ example: 'black' })
  value!: string;
}

export class ProductSearchItemResponseDto {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  id!: string;

  @ApiProperty({ example: 'nova-wireless-headphones' })
  slug!: string;

  @ApiProperty({ example: 'Nova Wireless Headphones' })
  name!: string;

  @ApiPropertyOptional({ example: 'Over-ear wireless headphones' })
  description?: string;

  @ApiProperty({ example: 'published', enum: ['draft', 'published', 'archived'] })
  status!: string;

  @ApiPropertyOptional({ type: () => ProductSearchBrandResponseDto })
  brand?: ProductSearchBrandResponseDto;

  @ApiProperty({ type: () => [ProductSearchCategoryResponseDto] })
  categories!: ProductSearchCategoryResponseDto[];

  @ApiProperty({ example: 99.99 })
  price!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;

  @ApiProperty({ example: ['https://cdn.example.com/products/nova-hp.jpg'] })
  images!: string[];

  @ApiProperty({ type: () => [ProductSearchAttributeResponseDto] })
  attributes!: ProductSearchAttributeResponseDto[];

  @ApiProperty({ example: ['wireless', 'audio'] })
  tags!: string[];

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-01-02T00:00:00.000Z' })
  updatedAt!: string;
}

export class SearchProductsResponseDto {
  @ApiProperty({ type: () => [ProductSearchItemResponseDto] })
  items!: ProductSearchItemResponseDto[];

  @ApiProperty({ example: 125 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  pageSize!: number;

  @ApiProperty({ example: 7 })
  totalPages!: number;
}

export class SearchProductsEnvelopeDto {
  @ApiProperty({ type: () => SearchProductsResponseDto })
  data!: SearchProductsResponseDto;

  @ApiProperty({ type: () => ApiResponseMetaDto })
  meta!: ApiResponseMetaDto;
}
