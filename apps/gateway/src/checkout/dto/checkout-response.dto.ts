import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiResponseMetaDto } from '../../common/dto/api-response-meta.dto';

export class CheckoutLineResponseDto {
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
  currency!: string;

  @ApiProperty()
  lineTotalAmount!: number;
}

export class CheckoutAdjustmentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  currency!: string;
}

export class CheckoutResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  cartId!: string;

  @ApiPropertyOptional()
  customerId?: string;

  @ApiProperty()
  status!: string;

  @ApiProperty({ type: [CheckoutLineResponseDto] })
  lines!: CheckoutLineResponseDto[];

  @ApiProperty({ type: [CheckoutAdjustmentResponseDto] })
  adjustments!: CheckoutAdjustmentResponseDto[];

  @ApiProperty()
  subtotalAmount!: number;

  @ApiProperty()
  totalAmount!: number;

  @ApiPropertyOptional()
  currency?: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class CheckoutPaymentResponseDto {
  @ApiProperty()
  paymentId!: string;

  @ApiProperty()
  provider!: string;

  @ApiProperty()
  redirectUrl!: string;
}

export class CompleteCheckoutResponseDto extends CheckoutResponseDto {
  @ApiProperty()
  orderId!: string;

  @ApiProperty()
  orderNumber!: string;

  @ApiProperty({ type: CheckoutPaymentResponseDto })
  payment!: CheckoutPaymentResponseDto;
}

export class CheckoutEnvelopeDto {
  @ApiProperty({ type: () => CheckoutResponseDto })
  data!: CheckoutResponseDto;

  @ApiProperty({ type: () => ApiResponseMetaDto })
  meta!: ApiResponseMetaDto;
}

export class CompleteCheckoutEnvelopeDto {
  @ApiProperty({ type: () => CompleteCheckoutResponseDto })
  data!: CompleteCheckoutResponseDto;

  @ApiProperty({ type: () => ApiResponseMetaDto })
  meta!: ApiResponseMetaDto;
}
