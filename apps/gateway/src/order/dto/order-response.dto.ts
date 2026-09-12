import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiResponseMetaDto } from '../../common/dto/api-response-meta.dto';

export class OrderLineResponseDto {
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

export class OrderResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  orderNumber!: string;

  @ApiProperty()
  customerId!: string;

  @ApiProperty({ enum: ['pending', 'confirmed', 'cancelled', 'completed'] })
  status!: string;

  @ApiProperty()
  totalAmount!: number;

  @ApiProperty()
  totalCurrency!: string;

  @ApiProperty({ type: () => [OrderLineResponseDto] })
  lines!: OrderLineResponseDto[];

  @ApiProperty()
  lineCount!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class OrderListResponseDto {
  @ApiProperty({ type: () => [OrderResponseDto] })
  items!: OrderResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;
}

export class OrderEnvelopeDto {
  @ApiProperty({ type: () => OrderResponseDto })
  data!: OrderResponseDto;

  @ApiProperty({ type: () => ApiResponseMetaDto })
  meta!: ApiResponseMetaDto;
}

export class OrderListEnvelopeDto {
  @ApiProperty({ type: () => OrderListResponseDto })
  data!: OrderListResponseDto;

  @ApiProperty({ type: () => ApiResponseMetaDto })
  meta!: ApiResponseMetaDto;
}
