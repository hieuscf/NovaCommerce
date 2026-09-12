import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class ChangeProductPriceRequestDto {
  @ApiProperty({ example: 129.99 })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  amount!: number;

  @ApiProperty({ example: 'USD', minLength: 3, maxLength: 3 })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency!: string;
}
