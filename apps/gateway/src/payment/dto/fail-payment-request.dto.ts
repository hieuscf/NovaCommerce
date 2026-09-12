import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class FailPaymentRequestDto {
  @ApiProperty({ description: 'Reason the payment failed' })
  @IsString()
  @MinLength(1)
  reason!: string;
}
