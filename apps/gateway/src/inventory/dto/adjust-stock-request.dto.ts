import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class AdjustStockRequestDto {
  @ApiProperty({ example: 10, description: 'Signed quantity change (negative reduces stock)' })
  @IsInt()
  delta!: number;

  @ApiProperty({ example: 'Cycle count correction' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
