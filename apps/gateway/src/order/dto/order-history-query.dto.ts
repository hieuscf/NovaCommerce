import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

enum OrderStatusQuery {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export class OrderHistoryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: OrderStatusQuery })
  @IsOptional()
  @IsEnum(OrderStatusQuery)
  status?: OrderStatusQuery;
}
