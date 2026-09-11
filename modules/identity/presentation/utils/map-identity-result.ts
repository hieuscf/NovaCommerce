import { ConflictException, HttpStatus, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import type { Result } from '@novacommerce/building-blocks';
import type { IdentityApplicationError } from '../../application/errors/identity-application.error';

export function mapIdentityResult<T>(result: Result<T, IdentityApplicationError>, successStatus = HttpStatus.OK): T {
  if (result.isSuccess) {
    return result.getValue();
  }

  const error = result.getError();
  switch (error.code) {
    case 'IDENTITY_ALREADY_EXISTS':
    case 'ROLE_ALREADY_EXISTS':
      throw new ConflictException(error.message);
    case 'INVALID_CREDENTIALS':
    case 'REFRESH_TOKEN_INVALID':
    case 'REFRESH_TOKEN_EXPIRED':
    case 'REFRESH_TOKEN_REVOKED':
      throw new UnauthorizedException(error.message);
    case 'PERMISSION_DENIED':
      throw new UnauthorizedException(error.message);
    default:
      throw new UnprocessableEntityException(error.message);
  }
}
