import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiResponseMetaDto } from '../../common/dto/api-response-meta.dto';

export class CategoryResponseDto {
  @ApiProperty({ example: '44444444-4444-4444-4444-444444444444' })
  id!: string;

  @ApiProperty({ example: 'Electronics' })
  name!: string;

  @ApiProperty({ example: 'electronics' })
  slug!: string;

  @ApiPropertyOptional({ example: '33333333-3333-3333-3333-333333333333' })
  parentId?: string;

  @ApiProperty({ example: '2026-09-12T00:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-09-12T00:00:00.000Z' })
  updatedAt!: string;
}

class CategoryEnvelopeDto {
  @ApiProperty({ type: () => CategoryResponseDto })
  data!: CategoryResponseDto;

  @ApiProperty({ type: () => ApiResponseMetaDto })
  meta!: ApiResponseMetaDto;
}

class CategoryListEnvelopeDto {
  @ApiProperty({ type: () => [CategoryResponseDto] })
  data!: CategoryResponseDto[];

  @ApiProperty({ type: () => ApiResponseMetaDto })
  meta!: ApiResponseMetaDto;
}

export { CategoryEnvelopeDto, CategoryListEnvelopeDto };
