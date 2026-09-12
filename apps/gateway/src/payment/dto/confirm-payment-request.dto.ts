import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ConfirmPaymentRequestDto {
  @ApiProperty({ description: 'Provider transaction reference' })
  @IsString()
  @MinLength(1)
  providerReference!: string;
}
