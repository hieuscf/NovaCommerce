import { DomainError } from '@novacommerce/building-blocks';

export class IdentityApplicationError extends DomainError {
  constructor(message: string, code: string) {
    super(message, code);
  }
}
