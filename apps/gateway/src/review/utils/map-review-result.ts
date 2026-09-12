import {
  ConflictException,
  ForbiddenException,
  HttpStatus,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { Result } from '@novacommerce/building-blocks';
import type { ReviewApplicationError } from '../../../../../modules/review/application/errors/review-application.error';

export function mapReviewResult<T>(
  result: Result<T, ReviewApplicationError>,
  successStatus = HttpStatus.OK,
): T {
  if (result.isSuccess) {
    return result.getValue();
  }

  const error = result.getError();
  switch (error.code) {
    case 'REVIEW_ALREADY_PUBLISHED':
    case 'REVIEW_PUBLISHED':
      throw new ConflictException(error.message);
    case 'REVIEW_FORBIDDEN':
      throw new ForbiddenException(error.message);
    case 'REVIEW_NOT_FOUND':
    case 'PRODUCT_NOT_FOUND':
    case 'USER_NOT_FOUND':
      throw new NotFoundException(error.message);
    default:
      throw new UnprocessableEntityException(error.message);
  }
}
