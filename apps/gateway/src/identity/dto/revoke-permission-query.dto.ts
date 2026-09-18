import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RevokePermissionQueryDto {
  @ApiProperty({ example: 'identity:role:create' })
  @IsString()
  @MinLength(3)
  key!: string;
}
