import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateIdentityLockRequestDto {
  @ApiProperty({ example: true, description: 'Lock the identity when true, unlock when false' })
  @IsBoolean()
  locked!: boolean;
}
