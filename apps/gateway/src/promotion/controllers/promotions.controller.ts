import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CalculateDiscountHandler } from '../../../../../modules/promotion/application/handlers/calculate-discount.handler';
import { ValidateCouponHandler } from '../../../../../modules/promotion/application/handlers/validate-coupon.handler';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ApiErrorResponseDto } from '../../common/dto/api-error-response.dto';
import { CalculateDiscountRequestDto } from '../dto/calculate-discount-request.dto';
import {
  CouponValidationEnvelopeDto,
  DiscountCalculationEnvelopeDto,
} from '../dto/promotion-response.dto';
import { ValidateCouponRequestDto } from '../dto/validate-coupon-request.dto';
import { mapPromotionResult } from '../utils/map-promotion-result';

@ApiTags('promotions')
@ApiBearerAuth('bearer')
@Controller('promotions')
export class PromotionsController {
  constructor(
    private readonly validateCouponHandler: ValidateCouponHandler,
    private readonly calculateDiscountHandler: CalculateDiscountHandler,
  ) {}

  @Post('coupons/validate')
  @RequirePermissions('promotion:read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate coupon',
    description: 'Checks coupon validity, promotion eligibility, and remaining usage limits.',
  })
  @ApiOkResponse({ type: CouponValidationEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async validateCoupon(@Body() body: ValidateCouponRequestDto) {
    const result = await this.validateCouponHandler.execute(body);
    return mapPromotionResult(result);
  }

  @Post('discounts/calculate')
  @RequirePermissions('promotion:read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calculate discount',
    description: 'Validates the coupon and returns the discount amount for the given subtotal.',
  })
  @ApiOkResponse({ type: DiscountCalculationEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async calculateDiscount(@Body() body: CalculateDiscountRequestDto) {
    const result = await this.calculateDiscountHandler.execute(body);
    return mapPromotionResult(result);
  }
}
