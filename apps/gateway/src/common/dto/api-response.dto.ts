import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseMetaDto } from './api-response-meta.dto';

export class ApiResponseDto<T = unknown> {
  @ApiProperty()
  data!: T;

  @ApiProperty({ type: () => ApiResponseMetaDto })
  meta!: ApiResponseMetaDto;
}
