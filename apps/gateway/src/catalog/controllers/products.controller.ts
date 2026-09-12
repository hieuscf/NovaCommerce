import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { ArchiveProductHandler } from '../../../../../modules/catalog/application/handlers/archive-product.handler';
import { ChangeProductPriceHandler } from '../../../../../modules/catalog/application/handlers/change-product-price.handler';
import { CreateProductHandler } from '../../../../../modules/catalog/application/handlers/create-product.handler';
import { GetProductByIdHandler } from '../../../../../modules/catalog/application/handlers/get-product-by-id.handler';
import { GetProductBySlugHandler } from '../../../../../modules/catalog/application/handlers/get-product-by-slug.handler';
import { ListProductsHandler } from '../../../../../modules/catalog/application/handlers/list-products.handler';
import { PublishProductHandler } from '../../../../../modules/catalog/application/handlers/publish-product.handler';
import { UpdateProductHandler } from '../../../../../modules/catalog/application/handlers/update-product.handler';
import { ProductStatus } from '../../../../../modules/catalog/domain/aggregates/product';
import { Public } from '../../common/decorators/public.decorator';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ApiErrorResponseDto } from '../../common/dto/api-error-response.dto';
import { ChangeProductPriceRequestDto } from '../dto/change-product-price-request.dto';
import { CreateProductRequestDto } from '../dto/create-product-request.dto';
import { ProductEnvelopeDto, ProductListEnvelopeDto } from '../dto/product-response.dto';
import { UpdateProductRequestDto } from '../dto/update-product-request.dto';
import { mapCatalogResult } from '../utils/map-catalog-result';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly createProductHandler: CreateProductHandler,
    private readonly getProductByIdHandler: GetProductByIdHandler,
    private readonly getProductBySlugHandler: GetProductBySlugHandler,
    private readonly listProductsHandler: ListProductsHandler,
    private readonly updateProductHandler: UpdateProductHandler,
    private readonly changeProductPriceHandler: ChangeProductPriceHandler,
    private readonly publishProductHandler: PublishProductHandler,
    private readonly archiveProductHandler: ArchiveProductHandler,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List products', description: 'Returns a paginated list of catalog products.' })
  @ApiQuery({ name: 'status', required: false, enum: ProductStatus })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 20 })
  @ApiOkResponse({ type: ProductListEnvelopeDto })
  async listProducts(
    @Query('status') status?: ProductStatus,
    @Query('categoryId') categoryId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.listProductsHandler.execute({
      status,
      categoryId,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
    return mapCatalogResult(result);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get product by slug' })
  @ApiParam({ name: 'slug', example: 'nova-wireless-headphones' })
  @ApiOkResponse({ type: ProductEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  async getProductBySlug(@Param('slug') slug: string) {
    const result = await this.getProductBySlugHandler.execute({ slug });
    return mapCatalogResult(result);
  }

  @Get(':productId')
  @Public()
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'productId', example: '11111111-1111-1111-1111-111111111111' })
  @ApiOkResponse({ type: ProductEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  async getProductById(@Param('productId') productId: string) {
    const result = await this.getProductByIdHandler.execute({ productId });
    return mapCatalogResult(result);
  }

  @Post()
  @ApiBearerAuth('bearer')
  @RequirePermissions('catalog:write')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create product' })
  @ApiCreatedResponse({ type: ProductEnvelopeDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async createProduct(@Body() body: CreateProductRequestDto) {
    const result = await this.createProductHandler.execute({
      name: body.name,
      slug: body.slug,
      basePriceAmount: body.basePriceAmount,
      basePriceCurrency: body.basePriceCurrency,
      categoryId: body.categoryId,
    });
    return mapCatalogResult(result, HttpStatus.CREATED);
  }

  @Patch(':productId')
  @ApiBearerAuth('bearer')
  @RequirePermissions('catalog:write')
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'productId', example: '11111111-1111-1111-1111-111111111111' })
  @ApiOkResponse({ type: ProductEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async updateProduct(@Param('productId') productId: string, @Body() body: UpdateProductRequestDto) {
    const result = await this.updateProductHandler.execute({
      productId,
      name: body.name,
      slug: body.slug,
      categoryId: body.categoryId,
    });
    return mapCatalogResult(result);
  }

  @Post(':productId/price')
  @ApiBearerAuth('bearer')
  @RequirePermissions('catalog:write')
  @ApiOperation({ summary: 'Change product base price' })
  @ApiParam({ name: 'productId', example: '11111111-1111-1111-1111-111111111111' })
  @ApiOkResponse({ type: ProductEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async changeProductPrice(
    @Param('productId') productId: string,
    @Body() body: ChangeProductPriceRequestDto,
  ) {
    const result = await this.changeProductPriceHandler.execute({
      productId,
      amount: body.amount,
      currency: body.currency,
    });
    return mapCatalogResult(result);
  }

  @Post(':productId/publish')
  @ApiBearerAuth('bearer')
  @RequirePermissions('catalog:write')
  @ApiOperation({ summary: 'Publish product' })
  @ApiParam({ name: 'productId', example: '11111111-1111-1111-1111-111111111111' })
  @ApiOkResponse({ type: ProductEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async publishProduct(@Param('productId') productId: string) {
    const result = await this.publishProductHandler.execute({ productId });
    return mapCatalogResult(result);
  }

  @Delete(':productId')
  @ApiBearerAuth('bearer')
  @RequirePermissions('catalog:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive product', description: 'Soft-deletes product by moving it to archived status.' })
  @ApiParam({ name: 'productId', example: '11111111-1111-1111-1111-111111111111' })
  @ApiOkResponse({ type: ProductEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async archiveProduct(@Param('productId') productId: string) {
    const result = await this.archiveProductHandler.execute({ productId });
    return mapCatalogResult(result);
  }
}
