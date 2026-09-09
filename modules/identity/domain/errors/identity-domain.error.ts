import { DomainError } from '@novacommerce/building-blocks';

export class IdentityDomainError extends DomainError {
  constructor(message: string, code: string) {
    super(message, code);
  }
}
