import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';

export class ReserveStockRequestDto {
  @ApiProperty({ example: '22222222-2222-2222-2222-222222222222' })
  @IsUUID()
  orderId!: string;

  @ApiProperty({ example: 'NOVA-HP-001' })
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  @IsUUID()
  warehouseId!: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;
}
