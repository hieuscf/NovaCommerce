import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseMetaDto } from './api-response-meta.dto';
import { ApiRootResponseDto } from './api-root-response.dto';
import { SecurityContextDto } from './security-context.dto';

export class ApiRootEnvelopeDto {
  @ApiProperty({ type: () => ApiRootResponseDto })
  data!: ApiRootResponseDto;

  @ApiProperty({ type: () => ApiResponseMetaDto })
  meta!: ApiResponseMetaDto;
}

export class SecurityContextEnvelopeDto {
  @ApiProperty({ type: () => SecurityContextDto })
  data!: SecurityContextDto;

  @ApiProperty({ type: () => ApiResponseMetaDto })
  meta!: ApiResponseMetaDto;
}

export class EchoEnvelopeDto {
  @ApiProperty({ type: Object, example: { message: 'hello' } })
  data!: { message: string };

  @ApiProperty({ type: () => ApiResponseMetaDto })
  meta!: ApiResponseMetaDto;
}

export class AdminStatusEnvelopeDto {
  @ApiProperty({ type: Object, example: { status: 'ok' } })
  data!: { status: string };

  @ApiProperty({ type: () => ApiResponseMetaDto })
  meta!: ApiResponseMetaDto;
}
