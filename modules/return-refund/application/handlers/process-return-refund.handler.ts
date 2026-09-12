import { Result } from '@novacommerce/building-blocks';
import type { IReturnRequestRepository } from '../../domain/repositories/i-return-request-repository';
import type { IPaymentRefundService } from '../contracts/i-payment-refund.contract';
import type { ReturnRequestResponseDto } from '../dto/return-response.dto';
import { ReturnRefundApplicationError } from '../errors/return-refund-application.error';
import { mapReturnRequestToDto } from '../mappers/map-return-request-to-dto';

export interface ProcessReturnRefundCommand {
  readonly returnRequestId: string;
}

export class ProcessReturnRefundHandler {
  constructor(
    private readonly returnRequestRepository: IReturnRequestRepository,
    private readonly paymentRefundService: IPaymentRefundService,
  ) {}

  async execute(
    command: ProcessReturnRefundCommand,
  ): Promise<Result<ReturnRequestResponseDto, ReturnRefundApplicationError>> {
    try {
      const returnRequest = await this.returnRequestRepository.findById(command.returnRequestId);
      if (!returnRequest) {
        return Result.fail(new ReturnRefundApplicationError('Return request not found', 'RETURN_NOT_FOUND'));
      }

      const refundAmount = returnRequest.getRefundAmount();
      const refundResult = await this.paymentRefundService.refund({
        paymentId: returnRequest.getPaymentId(),
        amount: refundAmount.amount,
      });
      if (refundResult.isFailure) {
        return Result.fail(refundResult.getError());
      }

      const markRefundedResult = returnRequest.markRefunded();
      if (markRefundedResult.isFailure) {
        return Result.fail(
          new ReturnRefundApplicationError(markRefundedResult.getError().message, markRefundedResult.getError().code),
        );
      }

      await this.returnRequestRepository.save(returnRequest);
      return Result.ok(mapReturnRequestToDto(returnRequest));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process return refund';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'PROCESS_RETURN_REFUND_FAILED';
      return Result.fail(new ReturnRefundApplicationError(message, code));
    }
  }
}
