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
import { ApproveReturnRequestHandler } from '../../../../../modules/return-refund/application/handlers/approve-return-request.handler';
import { CreateReturnRequestHandler } from '../../../../../modules/return-refund/application/handlers/create-return-request.handler';
import { ProcessReturnRefundHandler } from '../../../../../modules/return-refund/application/handlers/process-return-refund.handler';
import { RejectReturnRequestHandler } from '../../../../../modules/return-refund/application/handlers/reject-return-request.handler';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ApiErrorResponseDto } from '../../common/dto/api-error-response.dto';
import { CreateReturnRequestDto } from '../dto/create-return-request.dto';
import { ReturnRequestEnvelopeDto } from '../dto/return-response.dto';
import { mapReturnRefundResult } from '../utils/map-return-refund-result';

@ApiTags('returns')
@ApiBearerAuth('bearer')
@Controller('returns')
export class ReturnsController {
  constructor(
    private readonly createReturnRequestHandler: CreateReturnRequestHandler,
    private readonly approveReturnRequestHandler: ApproveReturnRequestHandler,
    private readonly rejectReturnRequestHandler: RejectReturnRequestHandler,
    private readonly processReturnRefundHandler: ProcessReturnRefundHandler,
  ) {}

  @Post()
  @RequirePermissions('return:write')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create return request',
    description: 'Creates a return request for a completed order with a succeeded payment.',
  })
  @ApiCreatedResponse({ type: ReturnRequestEnvelopeDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async createReturnRequest(@Body() body: CreateReturnRequestDto) {
    const result = await this.createReturnRequestHandler.execute(body);
    return mapReturnRefundResult(result, HttpStatus.CREATED);
  }

  @Post(':returnRequestId/approve')
  @RequirePermissions('return:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve return request' })
  @ApiParam({ name: 'returnRequestId', description: 'Return request ID' })
  @ApiCreatedResponse({ type: ReturnRequestEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async approveReturnRequest(@Param('returnRequestId') returnRequestId: string) {
    const result = await this.approveReturnRequestHandler.execute({ returnRequestId });
    return mapReturnRefundResult(result);
  }

  @Post(':returnRequestId/reject')
  @RequirePermissions('return:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject return request' })
  @ApiParam({ name: 'returnRequestId', description: 'Return request ID' })
  @ApiCreatedResponse({ type: ReturnRequestEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async rejectReturnRequest(@Param('returnRequestId') returnRequestId: string) {
    const result = await this.rejectReturnRequestHandler.execute({ returnRequestId });
    return mapReturnRefundResult(result);
  }

  @Post(':returnRequestId/refund')
  @RequirePermissions('return:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Process return refund',
    description: 'Refunds the payment for an approved return request and marks the return as refunded.',
  })
  @ApiParam({ name: 'returnRequestId', description: 'Return request ID' })
  @ApiCreatedResponse({ type: ReturnRequestEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async processReturnRefund(@Param('returnRequestId') returnRequestId: string) {
    const result = await this.processReturnRefundHandler.execute({ returnRequestId });
    return mapReturnRefundResult(result);
  }
}
