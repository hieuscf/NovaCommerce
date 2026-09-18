import { ConflictException, ForbiddenException, HttpStatus, NotFoundException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import type { Result } from '@novacommerce/building-blocks';
import type { IdentityApplicationError } from '../../../../../modules/identity/application/errors/identity-application.error';

export function mapIdentityResult<T>(result: Result<T, IdentityApplicationError>, successStatus = HttpStatus.OK): T {
  if (result.isSuccess) {
    return result.getValue();
  }

  const error = result.getError();
  switch (error.code) {
    case 'IDENTITY_ALREADY_EXISTS':
    case 'ROLE_ALREADY_EXISTS':
      throw new ConflictException(error.message);
    case 'ROLE_NOT_FOUND':
    case 'PERMISSION_NOT_FOUND':
    case 'IDENTITY_NOT_FOUND':
      throw new NotFoundException(error.message);
    case 'SYSTEM_ROLE_PROTECTED':
      throw new ForbiddenException(error.message);
    case 'INVALID_CREDENTIALS':
    case 'REFRESH_TOKEN_INVALID':
    case 'REFRESH_TOKEN_EXPIRED':
    case 'REFRESH_TOKEN_REVOKED':
    case 'PERMISSION_DENIED':
      throw new UnauthorizedException(error.message);
    default:
      throw new UnprocessableEntityException(error.message);
  }
}
