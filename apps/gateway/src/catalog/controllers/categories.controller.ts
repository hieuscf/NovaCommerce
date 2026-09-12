import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CreateCategoryHandler } from '../../../../../modules/catalog/application/handlers/create-category.handler';
import { GetCategoryByIdHandler } from '../../../../../modules/catalog/application/handlers/get-category-by-id.handler';
import { ListCategoriesHandler } from '../../../../../modules/catalog/application/handlers/list-categories.handler';
import { UpdateCategoryHandler } from '../../../../../modules/catalog/application/handlers/update-category.handler';
import { Public } from '../../common/decorators/public.decorator';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ApiErrorResponseDto } from '../../common/dto/api-error-response.dto';
import { CategoryEnvelopeDto, CategoryListEnvelopeDto } from '../dto/category-response.dto';
import { CreateCategoryRequestDto } from '../dto/create-category-request.dto';
import { UpdateCategoryRequestDto } from '../dto/update-category-request.dto';
import { mapCatalogResult } from '../utils/map-catalog-result';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly createCategoryHandler: CreateCategoryHandler,
    private readonly getCategoryByIdHandler: GetCategoryByIdHandler,
    private readonly listCategoriesHandler: ListCategoriesHandler,
    private readonly updateCategoryHandler: UpdateCategoryHandler,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List categories' })
  @ApiOkResponse({ type: CategoryListEnvelopeDto })
  async listCategories() {
    const result = await this.listCategoriesHandler.execute();
    return mapCatalogResult(result);
  }

  @Get(':categoryId')
  @Public()
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'categoryId', example: '44444444-4444-4444-4444-444444444444' })
  @ApiOkResponse({ type: CategoryEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  async getCategoryById(@Param('categoryId') categoryId: string) {
    const result = await this.getCategoryByIdHandler.execute({ categoryId });
    return mapCatalogResult(result);
  }

  @Post()
  @ApiBearerAuth('bearer')
  @RequirePermissions('catalog:write')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create category' })
  @ApiCreatedResponse({ type: CategoryEnvelopeDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async createCategory(@Body() body: CreateCategoryRequestDto) {
    const result = await this.createCategoryHandler.execute({
      name: body.name,
      slug: body.slug,
      parentId: body.parentId,
    });
    return mapCatalogResult(result, HttpStatus.CREATED);
  }

  @Patch(':categoryId')
  @ApiBearerAuth('bearer')
  @RequirePermissions('catalog:write')
  @ApiOperation({ summary: 'Update category' })
  @ApiParam({ name: 'categoryId', example: '44444444-4444-4444-4444-444444444444' })
  @ApiOkResponse({ type: CategoryEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async updateCategory(@Param('categoryId') categoryId: string, @Body() body: UpdateCategoryRequestDto) {
    const result = await this.updateCategoryHandler.execute({
      categoryId,
      name: body.name,
      slug: body.slug,
      parentId: body.parentId,
    });
    return mapCatalogResult(result);
  }
}
