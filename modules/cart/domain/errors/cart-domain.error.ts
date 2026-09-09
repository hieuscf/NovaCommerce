import { DomainError } from '@novacommerce/building-blocks';

export class CartDomainError extends DomainError {
  constructor(message: string, code: string) {
    super(message, code);
  }
}
