import {
  ConflictException,
  HttpStatus,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { Result } from '@novacommerce/building-blocks';
import type { UserApplicationError } from '../../../../../modules/user/application/errors/user-application.error';

export function mapUserResult<T>(result: Result<T, UserApplicationError>, successStatus = HttpStatus.OK): T {
  if (result.isSuccess) {
    return result.getValue();
  }

  const error = result.getError();
  switch (error.code) {
    case 'USER_ALREADY_EXISTS':
      throw new ConflictException(error.message);
    case 'USER_NOT_FOUND':
    case 'ADDRESS_NOT_FOUND':
      throw new NotFoundException(error.message);
    default:
      throw new UnprocessableEntityException(error.message);
  }
}
