import { Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { ConfirmPaymentHandler } from '../../../../../modules/payment/application/handlers/confirm-payment.handler';
import { FailPaymentHandler } from '../../../../../modules/payment/application/handlers/fail-payment.handler';
import { InitiatePaymentHandler } from '../../../../../modules/payment/application/handlers/initiate-payment.handler';
import { RefundPaymentHandler } from '../../../../../modules/payment/application/handlers/refund-payment.handler';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ApiErrorResponseDto } from '../../common/dto/api-error-response.dto';
import { ConfirmPaymentRequestDto } from '../dto/confirm-payment-request.dto';
import { FailPaymentRequestDto } from '../dto/fail-payment-request.dto';
import { InitiatePaymentRequestDto } from '../dto/initiate-payment-request.dto';
import { PaymentEnvelopeDto, PaymentInitiationEnvelopeDto } from '../dto/payment-response.dto';
import { RefundPaymentRequestDto } from '../dto/refund-payment-request.dto';
import { mapPaymentResult } from '../utils/map-payment-result';

@ApiTags('payments')
@ApiBearerAuth('bearer')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly initiatePaymentHandler: InitiatePaymentHandler,
    private readonly confirmPaymentHandler: ConfirmPaymentHandler,
    private readonly failPaymentHandler: FailPaymentHandler,
    private readonly refundPaymentHandler: RefundPaymentHandler,
  ) {}

  @Post('intents')
  @RequirePermissions('payment:write')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Initiate payment', description: 'Creates a payment intent and returns a provider redirect URL.' })
  @ApiCreatedResponse({ type: PaymentInitiationEnvelopeDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async initiatePayment(@Body() body: InitiatePaymentRequestDto) {
    const result = await this.initiatePaymentHandler.execute(body);
    return mapPaymentResult(result, HttpStatus.CREATED);
  }

  @Post(':paymentId/confirm')
  @RequirePermissions('payment:write')
  @ApiOperation({ summary: 'Confirm payment', description: 'Records a successful payment with the provider reference.' })
  @ApiParam({ name: 'paymentId', description: 'Payment ID' })
  @ApiCreatedResponse({ type: PaymentEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async confirmPayment(@Param('paymentId') paymentId: string, @Body() body: ConfirmPaymentRequestDto) {
    const result = await this.confirmPaymentHandler.execute({
      paymentId,
      providerReference: body.providerReference,
    });
    return mapPaymentResult(result);
  }

  @Post(':paymentId/fail')
  @RequirePermissions('payment:write')
  @ApiOperation({ summary: 'Fail payment', description: 'Records a payment failure.' })
  @ApiParam({ name: 'paymentId', description: 'Payment ID' })
  @ApiCreatedResponse({ type: PaymentEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async failPayment(@Param('paymentId') paymentId: string, @Body() body: FailPaymentRequestDto) {
    const result = await this.failPaymentHandler.execute({
      paymentId,
      reason: body.reason,
    });
    return mapPaymentResult(result);
  }

  @Post(':paymentId/refund')
  @RequirePermissions('payment:write')
  @ApiOperation({ summary: 'Refund payment', description: 'Records a refund foundation for a succeeded payment.' })
  @ApiParam({ name: 'paymentId', description: 'Payment ID' })
  @ApiCreatedResponse({ type: PaymentEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async refundPayment(@Param('paymentId') paymentId: string, @Body() body: RefundPaymentRequestDto) {
    const result = await this.refundPaymentHandler.execute({
      paymentId,
      amount: body.amount,
    });
    return mapPaymentResult(result);
  }
}
