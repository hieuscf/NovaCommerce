import { DomainError } from '@novacommerce/building-blocks';

export class CheckoutDomainError extends DomainError {
  constructor(message: string, code: string) {
    super(message, code);
  }
}
