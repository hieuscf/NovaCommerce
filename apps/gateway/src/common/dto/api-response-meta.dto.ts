import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiResponseMetaDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  requestId!: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  correlationId?: string;
}

export class PaginationMetaDto extends ApiResponseMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  pageSize!: number;

  @ApiProperty({ example: 100 })
  total!: number;
}
