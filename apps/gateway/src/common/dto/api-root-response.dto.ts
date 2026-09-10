import { ApiProperty } from '@nestjs/swagger';

export class ApiRootResponseDto {
  @ApiProperty({ example: 'NovaCommerce API' })
  name!: string;

  @ApiProperty({ example: 'v1' })
  version!: string;

  @ApiProperty({ example: 'operational' })
  status!: string;
}
