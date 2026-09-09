import { DomainError } from '@novacommerce/building-blocks';

export class UserDomainError extends DomainError {
  constructor(message: string, code: string) {
    super(message, code);
  }
}
