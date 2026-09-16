import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import type { SecurityContext } from '@novacommerce/building-blocks';
import { AddSavedPaymentMethodHandler } from '../../../../../modules/payment/application/handlers/add-saved-payment-method.handler';
import { ListSavedPaymentMethodsHandler } from '../../../../../modules/payment/application/handlers/list-saved-payment-methods.handler';
import { RemoveSavedPaymentMethodHandler } from '../../../../../modules/payment/application/handlers/remove-saved-payment-method.handler';
import { SetDefaultSavedPaymentMethodHandler } from '../../../../../modules/payment/application/handlers/set-default-saved-payment-method.handler';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiErrorResponseDto } from '../../common/dto/api-error-response.dto';
import { ApiResponseMetaDto } from '../../common/dto/api-response-meta.dto';
import {
  AddSavedPaymentMethodRequestDto,
  SavedPaymentMethodResponseDto,
} from '../dto/saved-payment-method.dto';
import { mapPaymentResult } from '../utils/map-payment-result';

class SavedPaymentMethodEnvelopeDto {
  data!: SavedPaymentMethodResponseDto;
  meta!: ApiResponseMetaDto;
}

class SavedPaymentMethodListEnvelopeDto {
  data!: SavedPaymentMethodResponseDto[];
  meta!: ApiResponseMetaDto;
}

@ApiTags('payment-methods')
@ApiBearerAuth('bearer')
@Controller('users/me/payment-methods')
export class SavedPaymentMethodsController {
  constructor(
    private readonly listHandler: ListSavedPaymentMethodsHandler,
    private readonly addHandler: AddSavedPaymentMethodHandler,
    private readonly removeHandler: RemoveSavedPaymentMethodHandler,
    private readonly setDefaultHandler: SetDefaultSavedPaymentMethodHandler,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List saved payment methods',
    description: 'Returns vault metadata only (brand, last4, expiry). Never returns CVV or PAN.',
  })
  @ApiOkResponse({ type: SavedPaymentMethodListEnvelopeDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async list(@CurrentUser() user: SecurityContext) {
    const result = await this.listHandler.execute({ identityId: user.userId });
    return mapPaymentResult(result);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Save a card',
    description:
      'Tokenizes the card immediately. CVV/CVC must not be sent (ADR-006). Re-enter CVV on each checkout charge.',
  })
  @ApiCreatedResponse({ type: SavedPaymentMethodEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async add(@CurrentUser() user: SecurityContext, @Body() body: AddSavedPaymentMethodRequestDto) {
    const result = await this.addHandler.execute({
      identityId: user.userId,
      cardNumber: body.cardNumber,
      cardholderName: body.cardholderName,
      expMonth: body.expMonth,
      expYear: body.expYear,
      isDefault: body.isDefault,
    });
    return mapPaymentResult(result, HttpStatus.CREATED);
  }

  @Delete(':paymentMethodId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a saved payment method' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  async remove(@CurrentUser() user: SecurityContext, @Param('paymentMethodId') paymentMethodId: string) {
    const result = await this.removeHandler.execute({
      identityId: user.userId,
      paymentMethodId,
    });
    mapPaymentResult(result);
  }

  @Post(':paymentMethodId/default')
  @ApiOperation({ summary: 'Set default saved payment method' })
  @ApiOkResponse({ type: SavedPaymentMethodEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  async setDefault(
    @CurrentUser() user: SecurityContext,
    @Param('paymentMethodId') paymentMethodId: string,
  ) {
    const result = await this.setDefaultHandler.execute({
      identityId: user.userId,
      paymentMethodId,
    });
    return mapPaymentResult(result);
  }
}
