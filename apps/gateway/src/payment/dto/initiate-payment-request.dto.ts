import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsString, IsUUID, Min } from 'class-validator';
import { PAYMENT_PROVIDERS } from '../../../../../modules/payment/application/contracts/payment-provider.contract';

export class InitiatePaymentRequestDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  orderId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  customerId!: string;

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ example: 'USD', minLength: 3, maxLength: 3 })
  @IsString()
  currency!: string;

  @ApiProperty({ enum: PAYMENT_PROVIDERS })
  @IsIn([...PAYMENT_PROVIDERS])
  provider!: (typeof PAYMENT_PROVIDERS)[number];
}
