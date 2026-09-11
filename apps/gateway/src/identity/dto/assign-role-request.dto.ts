import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignRoleRequestDto {
  @ApiProperty()
  @IsUUID()
  roleId!: string;
}
