import { DomainError } from '@novacommerce/building-blocks';

export class UserApplicationError extends DomainError {
  constructor(message: string, code: string) {
    super(message, code);
  }
}
