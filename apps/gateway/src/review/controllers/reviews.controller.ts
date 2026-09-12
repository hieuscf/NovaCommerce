import {
  Body,
  Controller,
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
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import type { SecurityContext } from '@novacommerce/building-blocks';
import { AddReviewImageHandler } from '../../../../../modules/review/application/handlers/add-review-image.handler';
import { CreateReviewHandler } from '../../../../../modules/review/application/handlers/create-review.handler';
import { GetReviewByIdHandler } from '../../../../../modules/review/application/handlers/get-review-by-id.handler';
import { ListReviewsByProductHandler } from '../../../../../modules/review/application/handlers/list-reviews-by-product.handler';
import { PublishReviewHandler } from '../../../../../modules/review/application/handlers/publish-review.handler';
import { UpdateReviewHandler } from '../../../../../modules/review/application/handlers/update-review.handler';
import { Public } from '../../common/decorators/public.decorator';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiErrorResponseDto } from '../../common/dto/api-error-response.dto';
import { AddReviewImageRequestDto } from '../dto/add-review-image-request.dto';
import { CreateReviewRequestDto } from '../dto/create-review-request.dto';
import { ReviewEnvelopeDto, ReviewListEnvelopeDto } from '../dto/review-response.dto';
import { UpdateReviewRequestDto } from '../dto/update-review-request.dto';
import { mapReviewResult } from '../utils/map-review-result';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly createReviewHandler: CreateReviewHandler,
    private readonly updateReviewHandler: UpdateReviewHandler,
    private readonly publishReviewHandler: PublishReviewHandler,
    private readonly getReviewByIdHandler: GetReviewByIdHandler,
    private readonly listReviewsByProductHandler: ListReviewsByProductHandler,
    private readonly addReviewImageHandler: AddReviewImageHandler,
  ) {}

  @Post()
  @ApiBearerAuth('bearer')
  @RequirePermissions('review:write')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create product review', description: 'Creates a draft review for a product.' })
  @ApiCreatedResponse({ type: ReviewEnvelopeDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async createReview(@CurrentUser() user: SecurityContext, @Body() body: CreateReviewRequestDto) {
    const result = await this.createReviewHandler.execute({
      identityId: user.userId,
      ...body,
    });
    return mapReviewResult(result, HttpStatus.CREATED);
  }

  @Get(':reviewId')
  @Public()
  @ApiOperation({ summary: 'Get review by id', description: 'Returns a published review by id.' })
  @ApiParam({ name: 'reviewId', description: 'Review ID' })
  @ApiOkResponse({ type: ReviewEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  async getReview(@Param('reviewId') reviewId: string) {
    const result = await this.getReviewByIdHandler.execute({ reviewId });
    return mapReviewResult(result);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List reviews by product', description: 'Returns published reviews for a product.' })
  @ApiQuery({ name: 'productId', required: true })
  @ApiOkResponse({ type: ReviewListEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  async listReviews(@Query('productId') productId: string) {
    const result = await this.listReviewsByProductHandler.execute({ productId });
    if (result.isFailure) {
      return mapReviewResult(result);
    }

    return { items: result.getValue() };
  }

  @Patch(':reviewId')
  @ApiBearerAuth('bearer')
  @RequirePermissions('review:write')
  @ApiOperation({ summary: 'Update draft review', description: 'Updates rating and text for a draft review owned by the caller.' })
  @ApiParam({ name: 'reviewId', description: 'Review ID' })
  @ApiOkResponse({ type: ReviewEnvelopeDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  async updateReview(
    @CurrentUser() user: SecurityContext,
    @Param('reviewId') reviewId: string,
    @Body() body: UpdateReviewRequestDto,
  ) {
    const result = await this.updateReviewHandler.execute({
      identityId: user.userId,
      reviewId,
      ...body,
    });
    return mapReviewResult(result);
  }

  @Post(':reviewId/publish')
  @ApiBearerAuth('bearer')
  @RequirePermissions('review:moderate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish review', description: 'Moderates and publishes a draft review.' })
  @ApiParam({ name: 'reviewId', description: 'Review ID' })
  @ApiOkResponse({ type: ReviewEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  async publishReview(@Param('reviewId') reviewId: string) {
    const result = await this.publishReviewHandler.execute({ reviewId });
    return mapReviewResult(result);
  }

  @Post(':reviewId/images')
  @ApiBearerAuth('bearer')
  @RequirePermissions('review:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add review image', description: 'Uploads an image to object storage and attaches it to a draft review.' })
  @ApiParam({ name: 'reviewId', description: 'Review ID' })
  @ApiOkResponse({ type: ReviewEnvelopeDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async addReviewImage(
    @CurrentUser() user: SecurityContext,
    @Param('reviewId') reviewId: string,
    @Body() body: AddReviewImageRequestDto,
  ) {
    const result = await this.addReviewImageHandler.execute({
      identityId: user.userId,
      reviewId,
      ...body,
    });
    return mapReviewResult(result);
  }
}
