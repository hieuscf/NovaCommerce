import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiResponseMetaDto } from '../../common/dto/api-response-meta.dto';

export class CartItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productId!: string;

  @ApiPropertyOptional()
  variantId?: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  unitPriceAmount!: number;

  @ApiProperty()
  unitPriceCurrency!: string;

  @ApiProperty()
  lineTotalAmount!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class CartResponseDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional()
  customerId?: string;

  @ApiProperty({ type: () => [CartItemResponseDto] })
  items!: CartItemResponseDto[];

  @ApiProperty()
  itemCount!: number;

  @ApiProperty()
  subtotalAmount!: number;

  @ApiPropertyOptional()
  currency?: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class CartEnvelopeDto {
  @ApiProperty({ type: () => CartResponseDto })
  data!: CartResponseDto;

  @ApiProperty({ type: () => ApiResponseMetaDto })
  meta!: ApiResponseMetaDto;
}
