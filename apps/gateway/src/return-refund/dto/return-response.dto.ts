import { ApiProperty } from '@nestjs/swagger';

export class ReturnRequestEnvelopeDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  orderId!: string;

  @ApiProperty()
  customerId!: string;

  @ApiProperty()
  paymentId!: string;

  @ApiProperty({ example: 'requested' })
  status!: string;

  @ApiProperty()
  refundAmount!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
