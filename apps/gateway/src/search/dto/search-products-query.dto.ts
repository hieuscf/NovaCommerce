import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PRODUCT_SEARCH_STATUSES } from '../../../../../modules/search/domain/entities/product-search-document';
import { PRODUCT_SEARCH_SORTS } from '../../../../../modules/search/domain/queries/product-search-criteria';
import { MAX_PRODUCT_SEARCH_QUERY_LENGTH } from '../../../../../modules/search/application/constants';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ValidatorConstraint({ name: 'minPriceNotGreaterThanMaxPrice', async: false })
class MinPriceNotGreaterThanMaxPriceConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const object = args.object as SearchProductsQueryDto;
    if (object.minPrice === undefined || object.maxPrice === undefined) {
      return true;
    }

    return object.minPrice <= object.maxPrice;
  }

  defaultMessage(): string {
    return 'minPrice must be less than or equal to maxPrice';
  }
}

export class SearchProductsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    name: 'q',
    description:
      'Keyword search across name, description, brand, tags, and category names. Omit to browse with filters only. Search does not query PostgreSQL.',
    example: 'headphones',
    maxLength: MAX_PRODUCT_SEARCH_QUERY_LENGTH,
  })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_PRODUCT_SEARCH_QUERY_LENGTH)
  @Transform(({ value }) => normalizeOptionalString(value))
  q?: string;

  @ApiPropertyOptional({
    description: 'Exact match on indexed category id',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Exact match on indexed brand id',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiPropertyOptional({ description: 'Minimum price (inclusive)', example: 10, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Validate(MinPriceNotGreaterThanMaxPriceConstraint)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price (inclusive)', example: 200, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Exact product status in the search index. Search does not invent catalog visibility rules.',
    enum: PRODUCT_SEARCH_STATUSES,
    example: 'published',
  })
  @IsOptional()
  @IsIn(PRODUCT_SEARCH_STATUSES)
  status?: (typeof PRODUCT_SEARCH_STATUSES)[number];

  @ApiPropertyOptional({
    description:
      'Sort whitelist. Default is relevance when q is present, otherwise createdAt_desc. Tie-breaker is product id.',
    enum: PRODUCT_SEARCH_SORTS,
    example: 'price_asc',
  })
  @IsOptional()
  @IsIn(PRODUCT_SEARCH_SORTS)
  sort?: (typeof PRODUCT_SEARCH_SORTS)[number];
}

function normalizeOptionalString(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
