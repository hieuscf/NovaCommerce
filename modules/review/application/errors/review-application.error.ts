import { DomainError } from '@novacommerce/building-blocks';

export class ReviewApplicationError extends DomainError {
  constructor(message: string, code: string) {
    super(message, code);
  }
}
