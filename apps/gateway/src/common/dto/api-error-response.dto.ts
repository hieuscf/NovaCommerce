import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiErrorBodyDto {
  @ApiProperty({ example: 'VALIDATION_ERROR' })
  code!: string;

  @ApiProperty({ example: 'Validation failed' })
  message!: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  details?: Record<string, unknown>;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  requestId!: string;
}

export class ApiErrorResponseDto {
  @ApiProperty({ type: () => ApiErrorBodyDto })
  error!: ApiErrorBodyDto;
}
