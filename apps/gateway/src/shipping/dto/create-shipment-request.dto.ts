import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsInt, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class ShipmentDestinationDto {
  @ApiProperty()
  @IsString()
  line1!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty()
  @IsString()
  city!: string;

  @ApiProperty()
  @IsString()
  state!: string;

  @ApiProperty()
  @IsString()
  postalCode!: string;

  @ApiProperty()
  @IsString()
  country!: string;
}

export class CreateShipmentItemDto {
  @ApiProperty({ description: 'Order line id' })
  @IsUUID()
  orderLineId!: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateShipmentRequestDto {
  @ApiProperty({ description: 'Order id' })
  @IsUUID()
  orderId!: string;

  @ApiProperty({ description: 'Carrier code for fulfillment' })
  @IsString()
  carrierCode!: string;

  @ApiProperty({ type: ShipmentDestinationDto })
  @ValidateNested()
  @Type(() => ShipmentDestinationDto)
  destination!: ShipmentDestinationDto;

  @ApiProperty({ type: [CreateShipmentItemDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateShipmentItemDto)
  @ArrayMinSize(1)
  items!: CreateShipmentItemDto[];
}
