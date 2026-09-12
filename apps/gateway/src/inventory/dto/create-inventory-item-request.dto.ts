import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';

export class CreateInventoryItemRequestDto {
  @ApiProperty({ example: 'NOVA-HP-001' })
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  @IsUUID()
  warehouseId!: string;

  @ApiProperty({ example: 100, minimum: 0 })
  @IsInt()
  @Min(0)
  onHand!: number;
}
