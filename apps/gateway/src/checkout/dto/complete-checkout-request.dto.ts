import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, IsUUID } from 'class-validator';
import { PAYMENT_PROVIDERS } from '../../../../../modules/payment/application/contracts/payment-provider.contract';

export class CompleteCheckoutRequestDto {
  @ApiProperty({ description: 'Warehouse used for order fulfillment' })
  @IsUUID()
  warehouseId!: string;

  @ApiProperty({ description: 'Customer shipping address id' })
  @IsUUID()
  shippingAddressId!: string;

  @ApiProperty({ enum: PAYMENT_PROVIDERS, description: 'Payment provider selection' })
  @IsString()
  @IsIn([...PAYMENT_PROVIDERS])
  paymentProvider!: (typeof PAYMENT_PROVIDERS)[number];
}
