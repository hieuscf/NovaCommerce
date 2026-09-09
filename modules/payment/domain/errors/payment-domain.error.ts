import { DomainError } from '@novacommerce/building-blocks';

export class PaymentDomainError extends DomainError {
  constructor(message: string, code: string) {
    super(message, code);
  }
}
