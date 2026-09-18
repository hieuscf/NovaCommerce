import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListIdentitiesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'support.one' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @ApiPropertyOptional({ enum: ['customer', 'admin'] })
  @IsOptional()
  @IsIn(['customer', 'admin'])
  role?: 'customer' | 'admin';

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'blocked'] })
  @IsOptional()
  @IsIn(['active', 'inactive', 'blocked'])
  status?: 'active' | 'inactive' | 'blocked';
}
