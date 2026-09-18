import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class RolePermissionChangeRequestDto {
  @ApiProperty({ example: 'catalog:product:create' })
  @IsString()
  @MinLength(3)
  permissionKey!: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  granted!: boolean;
}

export class UpdateRolePermissionsRequestDto {
  @ApiProperty({ type: [RolePermissionChangeRequestDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => RolePermissionChangeRequestDto)
  changes!: RolePermissionChangeRequestDto[];
}
