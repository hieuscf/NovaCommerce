import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ReleaseStockRequestDto {
  @ApiProperty({ example: '33333333-3333-3333-3333-333333333333' })
  @IsUUID()
  reservationId!: string;
}
