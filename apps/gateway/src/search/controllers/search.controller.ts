import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SearchProductsHandler } from '../../../../../modules/search/application/handlers/search-products.handler';
import { Public } from '../../common/decorators/public.decorator';
import { ApiErrorResponseDto } from '../../common/dto/api-error-response.dto';
import { SearchProductsQueryDto } from '../dto/search-products-query.dto';
import { SearchProductsEnvelopeDto } from '../dto/search-products-response.dto';
import { mapSearchResult } from '../utils/map-search-result';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchProductsHandler: SearchProductsHandler) {}

  @Get('products')
  @Public()
  @ApiOperation({
    summary: 'Search products',
    description:
      'Keyword search, filtering, sorting, and pagination against the OpenSearch product read model. Does not query PostgreSQL or Catalog.',
  })
  @ApiOkResponse({ type: SearchProductsEnvelopeDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto, description: 'Invalid query, filter, sort, or pagination' })
  @ApiServiceUnavailableResponse({ type: ApiErrorResponseDto, description: 'Search index unavailable' })
  async searchProducts(@Query() query: SearchProductsQueryDto) {
    const result = await this.searchProductsHandler.execute({
      query: query.q,
      categoryId: query.categoryId,
      brandId: query.brandId,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      status: query.status,
      sort: query.sort,
      page: query.page,
      pageSize: query.pageSize,
    });

    return mapSearchResult(result);
  }
}
