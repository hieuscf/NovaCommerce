import { Result } from '@novacommerce/building-blocks';
import type { IReturnRequestRepository } from '../../domain/repositories/i-return-request-repository';
import type { ReturnRequestResponseDto } from '../dto/return-response.dto';
import { ReturnRefundApplicationError } from '../errors/return-refund-application.error';
import { mapReturnRequestToDto } from '../mappers/map-return-request-to-dto';

export interface ApproveReturnRequestCommand {
  readonly returnRequestId: string;
}

export class ApproveReturnRequestHandler {
  constructor(private readonly returnRequestRepository: IReturnRequestRepository) {}

  async execute(
    command: ApproveReturnRequestCommand,
  ): Promise<Result<ReturnRequestResponseDto, ReturnRefundApplicationError>> {
    try {
      const returnRequest = await this.returnRequestRepository.findById(command.returnRequestId);
      if (!returnRequest) {
        return Result.fail(new ReturnRefundApplicationError('Return request not found', 'RETURN_NOT_FOUND'));
      }

      const approveResult = returnRequest.approve();
      if (approveResult.isFailure) {
        return Result.fail(
          new ReturnRefundApplicationError(approveResult.getError().message, approveResult.getError().code),
        );
      }

      await this.returnRequestRepository.save(returnRequest);
      return Result.ok(mapReturnRequestToDto(returnRequest));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to approve return request';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'APPROVE_RETURN_REQUEST_FAILED';
      return Result.fail(new ReturnRefundApplicationError(message, code));
    }
  }
}
