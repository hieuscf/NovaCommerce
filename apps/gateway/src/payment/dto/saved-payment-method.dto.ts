import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Length, Max, Min, MinLength } from 'class-validator';

/**
 * Save-card request. CVV/CVC fields are intentionally absent (ADR-006).
 * ValidationPipe forbidNonWhitelisted rejects any cvv/cvc extras.
 */
export class AddSavedPaymentMethodRequestDto {
  @ApiProperty({ description: 'Card number (tokenized immediately; never stored)' })
  @IsString()
  @MinLength(13)
  cardNumber!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  cardholderName!: string;

  @ApiProperty({ minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  expMonth!: number;

  @ApiProperty({ example: 2029 })
  @IsInt()
  @Min(2000)
  @Max(2100)
  expYear!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class SavedPaymentMethodResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  brand!: string;

  @ApiProperty({ minLength: 4, maxLength: 4 })
  @Length(4, 4)
  last4!: string;

  @ApiProperty()
  expMonth!: number;

  @ApiProperty()
  expYear!: number;

  @ApiProperty()
  cardholderName!: string;

  @ApiProperty()
  isDefault!: boolean;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
