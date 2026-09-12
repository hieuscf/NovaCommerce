import { randomUUID } from 'node:crypto';
import { Result } from '@novacommerce/building-blocks';
import { ReturnRequest } from '../../domain/aggregates/return-request';
import type { IReturnRequestRepository } from '../../domain/repositories/i-return-request-repository';
import { Money } from '../../domain/value-objects/money';
import type { IOrderReturnValidationService } from '../contracts/i-order-return-validation.contract';
import type { ReturnRequestResponseDto } from '../dto/return-response.dto';
import { ReturnRefundApplicationError } from '../errors/return-refund-application.error';
import { mapReturnRequestToDto } from '../mappers/map-return-request-to-dto';

export interface CreateReturnRequestCommand {
  readonly orderId: string;
  readonly customerId: string;
}

export class CreateReturnRequestHandler {
  constructor(
    private readonly orderReturnValidationService: IOrderReturnValidationService,
    private readonly returnRequestRepository: IReturnRequestRepository,
  ) {}

  async execute(
    command: CreateReturnRequestCommand,
  ): Promise<Result<ReturnRequestResponseDto, ReturnRefundApplicationError>> {
    try {
      const validationResult = await this.orderReturnValidationService.validate({
        orderId: command.orderId,
        customerId: command.customerId,
      });
      if (validationResult.isFailure) {
        return Result.fail(validationResult.getError());
      }

      const validation = validationResult.getValue();
      const existing = await this.returnRequestRepository.findActiveByOrderId(validation.orderId);
      if (existing) {
        return Result.fail(
          new ReturnRefundApplicationError('Return request already exists for order', 'RETURN_ALREADY_EXISTS'),
        );
      }

      const createResult = ReturnRequest.create(
        randomUUID(),
        validation.orderId,
        validation.customerId,
        validation.paymentId,
        Money.create(validation.refundAmount, validation.currency),
      );
      if (createResult.isFailure) {
        return Result.fail(
          new ReturnRefundApplicationError(createResult.getError().message, createResult.getError().code),
        );
      }

      const returnRequest = createResult.getValue();
      await this.returnRequestRepository.save(returnRequest);
      return Result.ok(mapReturnRequestToDto(returnRequest));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create return request';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'CREATE_RETURN_REQUEST_FAILED';
      return Result.fail(new ReturnRefundApplicationError(message, code));
    }
  }
}
