import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class CalculateShippingRequestDto {
  @ApiProperty({ description: 'Shipping method code (e.g. standard, express)' })
  @IsString()
  methodCode!: string;

  @ApiPropertyOptional({ description: 'Display name for the shipping method' })
  @IsOptional()
  @IsString()
  methodName?: string;

  @ApiProperty({ description: 'Destination country ISO code', example: 'US' })
  @IsString()
  @Length(2, 2)
  destinationCountry!: string;

  @ApiProperty({ description: 'Number of items in the shipment', minimum: 1 })
  @IsInt()
  @Min(1)
  itemCount!: number;

  @ApiProperty({ description: 'Currency ISO code', example: 'USD' })
  @IsString()
  @Length(3, 3)
  currency!: string;
}
