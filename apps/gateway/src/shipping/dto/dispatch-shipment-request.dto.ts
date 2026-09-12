import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DispatchShipmentRequestDto {
  @ApiProperty({ description: 'Carrier tracking number' })
  @IsString()
  trackingNumber!: string;
}
