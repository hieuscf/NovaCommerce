import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiResponseMetaDto } from '../../common/dto/api-response-meta.dto';

export class ProductVariantResponseDto {
  @ApiProperty({ example: '55555555-5555-5555-5555-555555555555' })
  id!: string;

  @ApiProperty({ example: 'NOVA-HP-001' })
  sku!: string;

  @ApiProperty({ example: 99.99 })
  priceAmount!: number;

  @ApiProperty({ example: 'USD' })
  priceCurrency!: string;

  @ApiProperty({ example: { color: 'black' } })
  attributes!: Record<string, string>;

  @ApiProperty({ example: '2026-09-12T00:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-09-12T00:00:00.000Z' })
  updatedAt!: string;
}

export class ProductImageResponseDto {
  @ApiProperty({ example: '66666666-6666-6666-6666-666666666666' })
  id!: string;

  @ApiProperty({ example: 'https://cdn.example.com/products/nova-hp.jpg' })
  url!: string;

  @ApiProperty({ example: 0 })
  sortOrder!: number;

  @ApiProperty({ example: '2026-09-12T00:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-09-12T00:00:00.000Z' })
  updatedAt!: string;
}

export class ProductAttributeResponseDto {
  @ApiProperty({ example: '77777777-7777-7777-7777-777777777777' })
  id!: string;

  @ApiProperty({ example: 'Material' })
  name!: string;

  @ApiProperty({ example: 'Aluminum' })
  value!: string;

  @ApiProperty({ example: '2026-09-12T00:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-09-12T00:00:00.000Z' })
  updatedAt!: string;
}

export class ProductOptionResponseDto {
  @ApiProperty({ example: '88888888-8888-8888-8888-888888888888' })
  id!: string;

  @ApiProperty({ example: 'Color' })
  name!: string;

  @ApiProperty({ example: ['black', 'white'] })
  values!: string[];

  @ApiProperty({ example: '2026-09-12T00:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-09-12T00:00:00.000Z' })
  updatedAt!: string;
}

export class ProductResponseDto {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  id!: string;

  @ApiProperty({ example: 'Nova Wireless Headphones' })
  name!: string;

  @ApiProperty({ example: 'nova-wireless-headphones' })
  slug!: string;

  @ApiProperty({ example: 99.99 })
  basePriceAmount!: number;

  @ApiProperty({ example: 'USD' })
  basePriceCurrency!: string;

  @ApiProperty({ example: 'draft', enum: ['draft', 'published', 'archived'] })
  status!: string;

  @ApiPropertyOptional({ example: '44444444-4444-4444-4444-444444444444' })
  categoryId?: string;

  @ApiProperty({ type: () => [ProductVariantResponseDto] })
  variants!: ProductVariantResponseDto[];

  @ApiProperty({ type: () => [ProductImageResponseDto] })
  images!: ProductImageResponseDto[];

  @ApiProperty({ type: () => [ProductAttributeResponseDto] })
  attributes!: ProductAttributeResponseDto[];

  @ApiProperty({ type: () => [ProductOptionResponseDto] })
  options!: ProductOptionResponseDto[];

  @ApiProperty({ example: '2026-09-12T00:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-09-12T00:00:00.000Z' })
  updatedAt!: string;
}

export class ProductListResponseDto {
  @ApiProperty({ type: () => [ProductResponseDto] })
  items!: ProductResponseDto[];

  @ApiProperty({ example: 100 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  pageSize!: number;
}

class ProductEnvelopeDto {
  @ApiProperty({ type: () => ProductResponseDto })
  data!: ProductResponseDto;

  @ApiProperty({ type: () => ApiResponseMetaDto })
  meta!: ApiResponseMetaDto;
}

class ProductListEnvelopeDto {
  @ApiProperty({ type: () => ProductListResponseDto })
  data!: ProductListResponseDto;

  @ApiProperty({ type: () => ApiResponseMetaDto })
  meta!: ApiResponseMetaDto;
}

export { ProductEnvelopeDto, ProductListEnvelopeDto };
