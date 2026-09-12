import { Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import type { SecurityContext } from '@novacommerce/building-blocks';
import { CompleteCheckoutHandler } from '../../../../../modules/checkout/application/handlers/complete-checkout.handler';
import { StartCheckoutHandler } from '../../../../../modules/checkout/application/handlers/start-checkout.handler';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiErrorResponseDto } from '../../common/dto/api-error-response.dto';
import { CompleteCheckoutRequestDto } from '../dto/complete-checkout-request.dto';
import { CompleteCheckoutEnvelopeDto, CheckoutEnvelopeDto } from '../dto/checkout-response.dto';
import { StartCheckoutRequestDto } from '../dto/start-checkout-request.dto';
import { mapCheckoutResult } from '../utils/map-checkout-result';

@ApiTags('checkout')
@ApiBearerAuth('bearer')
@Controller('users/me/checkout')
export class CheckoutController {
  constructor(
    private readonly startCheckoutHandler: StartCheckoutHandler,
    private readonly completeCheckoutHandler: CompleteCheckoutHandler,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Start checkout',
    description: 'Validates cart, inventory, customer address, and promotions; creates a checkout session.',
  })
  @ApiCreatedResponse({ type: CheckoutEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async startCheckout(@CurrentUser() user: SecurityContext, @Body() body: StartCheckoutRequestDto) {
    const result = await this.startCheckoutHandler.execute({
      identityId: user.userId,
      warehouseId: body.warehouseId,
      shippingAddressId: body.shippingAddressId,
      couponCode: body.couponCode,
    });
    return mapCheckoutResult(result, HttpStatus.CREATED);
  }

  @Post(':sessionId/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete checkout',
    description: 'Creates an order, completes the checkout session, and initiates payment with the selected provider.',
  })
  @ApiParam({ name: 'sessionId', description: 'Checkout session ID' })
  @ApiCreatedResponse({ type: CompleteCheckoutEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async completeCheckout(
    @CurrentUser() user: SecurityContext,
    @Param('sessionId') sessionId: string,
    @Body() body: CompleteCheckoutRequestDto,
  ) {
    const result = await this.completeCheckoutHandler.execute({
      identityId: user.userId,
      sessionId,
      warehouseId: body.warehouseId,
      shippingAddressId: body.shippingAddressId,
      paymentProvider: body.paymentProvider,
    });
    return mapCheckoutResult(result);
  }
}
