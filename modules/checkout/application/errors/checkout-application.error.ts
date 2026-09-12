import { DomainError } from '@novacommerce/building-blocks';

export class CheckoutApplicationError extends DomainError {
  constructor(message: string, code: string) {
    super(message, code);
  }
}
