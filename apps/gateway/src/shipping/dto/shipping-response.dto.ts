import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ShippingQuoteEnvelopeDto {
  @ApiProperty()
  methodCode!: string;

  @ApiProperty()
  methodName!: string;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  estimatedDays!: number;
}

export class ShipmentItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  orderLineId!: string;

  @ApiProperty()
  quantity!: number;
}

export class TrackingRecordDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  location!: string;

  @ApiProperty()
  recordedAt!: string;
}

export class ShipmentDestinationResponseDto {
  @ApiProperty()
  line1!: string;

  @ApiPropertyOptional()
  line2?: string;

  @ApiProperty()
  city!: string;

  @ApiProperty()
  state!: string;

  @ApiProperty()
  postalCode!: string;

  @ApiProperty()
  country!: string;
}

export class ShipmentEnvelopeDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  orderId!: string;

  @ApiProperty()
  carrierCode!: string;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional()
  trackingNumber?: string;

  @ApiProperty({ type: ShipmentDestinationResponseDto })
  destination!: ShipmentDestinationResponseDto;

  @ApiProperty({ type: [ShipmentItemDto] })
  items!: ShipmentItemDto[];

  @ApiProperty({ type: [TrackingRecordDto] })
  trackingRecords!: TrackingRecordDto[];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
