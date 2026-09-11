import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssignPermissionRequestDto {
  @ApiProperty({ example: 'product:read' })
  @IsString()
  permissionKey!: string;
}
