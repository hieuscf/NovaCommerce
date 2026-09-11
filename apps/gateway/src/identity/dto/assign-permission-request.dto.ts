import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssignPermissionRequestDto {
  @ApiProperty({ example: 'identity:role:assign' })
  @IsString()
  permissionKey!: string;
}
